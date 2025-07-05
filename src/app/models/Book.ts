import mongoose, { Schema, Model } from 'mongoose';
import { IBookDocument } from '../types';

const bookSchema = new Schema<IBookDocument>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    // validate: {
    //   validator: function(v: string): boolean {
    //     // Basic ISBN validation (10 or 13 digits)
    //     return /^(?:\d{10}|\d{13})$/.test(v.replace(/[-\s]/g, ''));
    //   },
    //   message: 'Please provide a valid ISBN (10 or 13 digits)'
    // }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  copies: {
    type: Number,
    required: [true, 'Number of copies is required'],
    min: [0, 'Copies cannot be negative'],
    default: 1
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available copies
bookSchema.virtual('availableCopies').get(function(this: IBookDocument): number {
  return this.copies;
});

// Pre-save middleware to update availability based on copies
bookSchema.pre('save', function(this: IBookDocument, next): void {
  this.available = this.copies > 0;
  next();
});

// Static method to find available books
bookSchema.statics['findAvailable'] = function(): Promise<IBookDocument[]> {
  return this.find({ available: true });
};

// Instance method to check if book can be borrowed
bookSchema.methods['canBeBorrowed'] = function(this: IBookDocument, quantity: number = 1): boolean {
  return this.available && this.copies >= quantity;
};

// Instance method to borrow copies
bookSchema.methods['borrowCopies'] = function(this: IBookDocument, quantity: number): boolean {
  if (this['canBeBorrowed'](quantity)) {
    this.copies -= quantity;
    this.available = this.copies > 0;
    return true;
  }
  return false;
};

// Instance method to return copies
bookSchema.methods['returnCopies'] = function(this: IBookDocument, quantity: number): Promise<IBookDocument> {
  this.copies += quantity;
  this.available = true;
  return this.save();
};

// Extend the mongoose Document interface
interface BookModel extends Model<IBookDocument> {
  findAvailable(): Promise<IBookDocument[]>;
}

const Book: BookModel = mongoose.model<IBookDocument, BookModel>('Book', bookSchema);

export default Book; 