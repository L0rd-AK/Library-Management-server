import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Borrow from '../models/Borrow';
import Book from '../models/Book';
import { 
  IBorrowDocument, 
  IBorrowSummary,
  ApiResponse, 
  PaginationInfo, 
  BorrowRequest, 
  CreateBorrowRequest 
} from '../types';

// Get all borrows with pagination
export const getAllBorrows = async (req: BorrowRequest, res: Response<ApiResponse<IBorrowDocument[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.book) filter.book = req.query.book;

    const borrows = await Borrow.find(filter)
      .populate('book', 'title author isbn')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Borrow.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      data: borrows,
      pagination
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching borrows',
      error: errorMessage
    });
  }
};

// Get single borrow by ID
export const getBorrowById = async (req: Request<{ id: string }>, res: Response<ApiResponse<IBorrowDocument>>): Promise<void> => {
  try {
    const borrow = await Borrow.findById(req.params.id).populate('book');
    
    if (!borrow) {
      res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: borrow
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching borrow',
      error: errorMessage
    });
  }
};

// Create new borrow (borrow a book)
export const createBorrow = async (req: Request<{}, {}, CreateBorrowRequest>, res: Response<ApiResponse<IBorrowDocument>>): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const { bookId, quantity, dueDate } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    // Check if book can be borrowed
    if (!book.canBeBorrowed(quantity)) {
      res.status(400).json({
        success: false,
        message: `Cannot borrow ${quantity} copies. Only ${book.copies} copies available.`
      });
      return;
    }

    // Create borrow record
    const borrow = await Borrow.create({
      book: bookId,
      quantity,
      dueDate: new Date(dueDate)
    });

    // Update book copies
    book.borrowCopies(quantity);
    await book.save();

    // Populate book details for response
    await borrow.populate('book', 'title author isbn');

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: borrow
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error borrowing book',
      error: errorMessage
    });
  }
};

// Return borrowed books
export const returnBorrow = async (req: Request<{ id: string }>, res: Response<ApiResponse<IBorrowDocument>>): Promise<void> => {
  try {
    const borrow = await Borrow.findById(req.params.id).populate('book');
    
    if (!borrow) {
      res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
      return;
    }

    if (borrow.status === 'returned') {
      res.status(400).json({
        success: false,
        message: 'Books have already been returned'
      });
      return;
    }

    // Return the books
    await borrow.returnBooks();
    
    // Update book copies
    const book = await Book.findById(borrow.book);
    if (book) {
      book.returnCopies(borrow.quantity);
    }

    res.status(200).json({
      success: true,
      message: 'Books returned successfully',
      data: borrow
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error returning books',
      error: errorMessage
    });
  }
};

// Get borrow summary (aggregated)
export const getBorrowSummary = async (_req: Request, res: Response<ApiResponse<IBorrowSummary[]>>): Promise<void> => {
  try {
    const summary = await Borrow.getBorrowSummary();
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching borrow summary',
      error: errorMessage
    });
  }
};

// Get overdue borrows
export const getOverdueBorrows = async (_req: Request, res: Response<ApiResponse<IBorrowDocument[]>>): Promise<void> => {
  try {
    const overdueBorrows = await Borrow.findOverdue();
    
    res.status(200).json({
      success: true,
      data: overdueBorrows
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue borrows',
      error: errorMessage
    });
  }
};

// Delete borrow record
export const deleteBorrow = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    
    if (!borrow) {
      res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
      return;
    }

    // If books are still borrowed, return them first
    if (borrow.status !== 'returned') {
      const book = await Book.findById(borrow.book);
      if (book) {
        book.returnCopies(borrow.quantity);
      }
    }

    await Borrow.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Borrow record deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deleting borrow record',
      error: errorMessage
    });
  }
}; 