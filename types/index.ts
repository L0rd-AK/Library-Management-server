import { Request } from 'express';
import { Document } from 'mongoose';

// Book interfaces
export interface IBook {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  copies: number;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookDocument extends Document, IBook {
  availableCopies: number;
  canBeBorrowed(quantity?: number): boolean;
  borrowCopies(quantity: number): boolean;
  returnCopies(quantity: number): Promise<IBookDocument>;
}

// Borrow interfaces
export interface IBorrow {
  book: string | IBook;
  quantity: number;
  dueDate: Date;
  status: 'active' | 'returned' | 'overdue';
  returnedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBorrowDocument extends Document, IBorrow {
  isOverdue: boolean;
  daysRemaining: number;
  returnBooks(): Promise<IBorrowDocument>;
}

// Borrow summary interface
export interface IBorrowSummary {
  _id: string;
  bookTitle: string;
  isbn: string;
  totalQuantityBorrowed: number;
  activeBorrows: number;
  overdueBorrows: number;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request interfaces
export interface BookQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  genre?: string;
  available?: string;
  [key: string]: string | undefined;
}

export interface BorrowQueryParams {
  page?: string;
  limit?: string;
  status?: string;
  book?: string;
  [key: string]: string | undefined;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  copies: number;
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {}

export interface CreateBorrowRequest {
  bookId: string;
  quantity: number;
  dueDate: string;
}

// Extended Request interfaces
export interface BookRequest extends Request {
  query: BookQueryParams;
}

export interface BorrowRequest extends Request {
  query: BorrowQueryParams;
}

// Error interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  error?: string;
} 