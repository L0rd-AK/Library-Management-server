import { body, param, query, ValidationChain } from 'express-validator';

// Book validation rules
export const validateBook: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  
  body('genre')
    .trim()
    .notEmpty()
    .withMessage('Genre is required')
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters'),
  
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required'),
    // .matches(/^(?:\d{10}|\d{13})$/)
    // .withMessage('Please provide a valid ISBN (10 or 13 digits)'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('copies')
    .isInt({ min: 0 })
    .withMessage('Copies must be a non-negative integer')
];

// Borrow validation rules
export const validateBorrow: ValidationChain[] = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID format'),
  
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value: string) => {
      const dueDate = new Date(value);
      const now = new Date();
      if (dueDate <= now) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

// ID parameter validation
export const validateId: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Pagination query validation
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Book search validation
export const validateBookSearch: ValidationChain[] = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
  
  query('genre')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Genre cannot be empty'),
  
  query('available')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Available must be true or false')
]; 