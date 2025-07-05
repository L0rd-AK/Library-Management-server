import express from 'express';
import * as bookController from '../controllers/bookController';
import { validateBook, validateId, validatePagination, validateBookSearch } from '../middleware/validation';

const app = express.Router();

// GET /api/books - Get all books with pagination and filtering
app.get('/', validatePagination, validateBookSearch, bookController.getAllBooks);

// GET /api/books/available - Get available books only
app.get('/available', bookController.getAvailableBooks);

// GET /api/books/:id - Get single book by ID
app.get('/:id', validateId, bookController.getBookById);

// POST /api/books - Create new book
app.post('/', validateBook, bookController.createBook);

// PUT /api/books/:id - Update book
app.put('/:id', validateId, validateBook, bookController.updateBook);

// DELETE /api/books/:id - Delete book
app.delete('/:id', validateId, bookController.deleteBook);

export default app; 