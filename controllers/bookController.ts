import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Book from '../models/Book';
import { 
  IBookDocument, 
  ApiResponse, 
  PaginationInfo, 
  BookRequest, 
  CreateBookRequest, 
  UpdateBookRequest 
} from '../types';

// Get all books with pagination
export const getAllBooks = async (req: BookRequest, res: Response<ApiResponse<IBookDocument[]>>): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.available !== undefined) filter.available = req.query.available === 'true';
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { isbn: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(filter);
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
      data: books,
      pagination
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: errorMessage
    });
  }
};

// Get single book by ID
export const getBookById = async (req: Request, res: Response<ApiResponse<IBookDocument>>): Promise<void> => {
  try {
    const book = await Book.findById(req.params['id']);
    
    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: errorMessage
    });
  }
};

// Create new book
export const createBook = async (req: Request<{}, {}, CreateBookRequest>, res: Response<ApiResponse<IBookDocument>>): Promise<void> => {
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

    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'ISBN already exists'
      });
      return;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: errorMessage
    });
  }
};

// Update book
export const updateBook = async (req: Request<{ id: string }, {}, UpdateBookRequest>, res: Response<ApiResponse<IBookDocument>>): Promise<void> => {
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

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'ISBN already exists'
      });
      return;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: errorMessage
    });
  }
};

// Delete book
export const deleteBook = async (req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: errorMessage
    });
  }
};

// Get available books
export const getAvailableBooks = async (_req: Request, res: Response<ApiResponse<IBookDocument[]>>): Promise<void> => {
  try {
    const books = await Book.findAvailable();
    
    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching available books',
      error: errorMessage
    });
  }
}; 