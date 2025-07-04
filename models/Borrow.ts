import mongoose, { Schema, Model } from 'mongoose';
import { IBorrowDocument, IBorrowSummary } from '../types';

const borrowSchema = new Schema<IBorrowDocument>({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v: Date): boolean {
        return v > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active'
  },
  returnedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if borrow is overdue
borrowSchema.virtual('isOverdue').get(function(this: IBorrowDocument): boolean {
  if (this.status === 'returned') return false;
  return new Date() > this.dueDate;
});

// Virtual for days remaining
borrowSchema.virtual('daysRemaining').get(function(this: IBorrowDocument): number {
  if (this.status === 'returned') return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update status based on due date
borrowSchema.pre('save', function(this: IBorrowDocument, next): void {
  if (this.status === 'active' && this.isOverdue) {
    this.status = 'overdue';
  }
  next();
});

// Static method to find overdue borrows
borrowSchema.statics['findOverdue'] = function(): Promise<IBorrowDocument[]> {
  return this.find({
    status: { $in: ['active', 'overdue'] },
    dueDate: { $lt: new Date() }
  }).populate('book');
};

// Static method to get borrow summary
borrowSchema.statics['getBorrowSummary'] = function(): Promise<IBorrowSummary[]> {
  return this.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    {
      $unwind: '$bookDetails'
    },
    {
      $group: {
        _id: '$book',
        bookTitle: { $first: '$bookDetails.title' },
        isbn: { $first: '$bookDetails.isbn' },
        totalQuantityBorrowed: { $sum: '$quantity' },
        activeBorrows: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, '$quantity', 0]
          }
        },
        overdueBorrows: {
          $sum: {
            $cond: [{ $eq: ['$status', 'overdue'] }, '$quantity', 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        bookTitle: 1,
        isbn: 1,
        totalQuantityBorrowed: 1,
        activeBorrows: 1,
        overdueBorrows: 1
      }
    },
    {
      $sort: { totalQuantityBorrowed: -1 }
    }
  ]);
};

// Instance method to return borrowed books
borrowSchema.methods['returnBooks'] = function(this: IBorrowDocument): Promise<IBorrowDocument> {
  this.status = 'returned';
  this.returnedDate = new Date();
  return this.save();
};

// Extend the mongoose Document interface
interface BorrowModel extends Model<IBorrowDocument> {
  findOverdue(): Promise<IBorrowDocument[]>;
  getBorrowSummary(): Promise<IBorrowSummary[]>;
}

const Borrow: BorrowModel = mongoose.model<IBorrowDocument, BorrowModel>('Borrow', borrowSchema);

export default Borrow; 