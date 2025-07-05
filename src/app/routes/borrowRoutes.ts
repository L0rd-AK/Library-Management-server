import express from 'express';
import * as borrowController from '../controllers/borrowController';
import { validateBorrow, validateId, validatePagination } from '../middleware/validation';

const app = express.Router();

// GET /api/borrows - Get all borrows with pagination
app.get('/', validatePagination, borrowController.getAllBorrows);

// GET /api/borrows/summary - Get borrow summary (aggregated)
app.get('/summary', borrowController.getBorrowSummary);

// GET /api/borrows/overdue - Get overdue borrows
app.get('/overdue', borrowController.getOverdueBorrows);

// GET /api/borrows/:id - Get single borrow by ID
app.get('/:id', validateId, borrowController.getBorrowById);

// POST /api/borrows - Create new borrow (borrow a book)
app.post('/', validateBorrow, borrowController.createBorrow);

// PUT /api/borrows/:id/return - Return borrowed books
app.put('/:id/return', validateId, borrowController.returnBorrow);

// DELETE /api/borrows/:id - Delete borrow record
app.delete('/:id', validateId, borrowController.deleteBorrow);

export default app; 