# Library Management System Backend

A RESTful API backend for a library management system built with Node.js, Express, and MongoDB.

## Features

- **Book Management**: Full CRUD operations for books
- **Borrow Management**: Borrow and return books with due date tracking
- **Pagination**: Support for paginated results
- **Search & Filtering**: Search books by title, author, ISBN and filter by genre/availability
- **Borrow Summary**: Aggregated view of borrowed books
- **Validation**: Comprehensive input validation
- **Error Handling**: Consistent error responses

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Programming language
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `config.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/library_management
   NODE_ENV=development
   ```
4. Start MongoDB service
5. Run the application:
   ```bash
   # Development mode (TypeScript)
   npm run dev
   
   # Build for production
   npm run build
   
   # Production mode
   npm start
   ```

## API Endpoints

### Books

#### Get All Books
```
GET /api/books
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in title, author, ISBN
- `genre` (optional): Filter by genre
- `available` (optional): Filter by availability (true/false)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Available Books
```
GET /api/books/available
```

#### Get Book by ID
```
GET /api/books/:id
```

#### Create Book
```
POST /api/books
```
**Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "Fiction",
  "isbn": "1234567890",
  "description": "Book description",
  "copies": 5
}
```

#### Update Book
```
PUT /api/books/:id
```

#### Delete Book
```
DELETE /api/books/:id
```

### Borrows

#### Get All Borrows
```
GET /api/borrows
```
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (active/returned/overdue)
- `book` (optional): Filter by book ID

#### Get Borrow Summary
```
GET /api/borrows/summary
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "book_id",
      "bookTitle": "Book Title",
      "isbn": "1234567890",
      "totalQuantityBorrowed": 10,
      "activeBorrows": 5,
      "overdueBorrows": 2
    }
  ]
}
```

#### Get Overdue Borrows
```
GET /api/borrows/overdue
```

#### Get Borrow by ID
```
GET /api/borrows/:id
```

#### Borrow a Book
```
POST /api/borrows
```
**Body:**
```json
{
  "bookId": "book_id",
  "quantity": 2,
  "dueDate": "2024-02-15T00:00:00.000Z"
}
```

#### Return Books
```
PUT /api/borrows/:id/return
```

#### Delete Borrow Record
```
DELETE /api/borrows/:id
```

## Data Models

### Book Schema
```javascript
{
  title: String (required, max 200 chars),
  author: String (required, max 100 chars),
  genre: String (required, max 50 chars),
  isbn: String (required, unique, 10 or 13 digits),
  description: String (required, max 1000 chars),
  copies: Number (required, min 0),
  available: Boolean (auto-calculated),
  createdAt: Date,
  updatedAt: Date
}
```

### Borrow Schema
```javascript
{
  book: ObjectId (ref: Book, required),
  quantity: Number (required, min 1, max 100),
  dueDate: Date (required, future date),
  status: String (enum: active/returned/overdue, default: active),
  returnedDate: Date (default: null),
  createdAt: Date,
  updatedAt: Date
}
```

## Business Logic

### Book Availability
- Books are automatically marked as unavailable when copies reach 0
- Available status is updated whenever copies are modified

### Borrowing Rules
- Cannot borrow more copies than available
- Due date must be in the future
- Borrow status automatically updates to 'overdue' when due date passes

### Return Process
- Returning books increases the book's copy count
- Book availability is restored if copies become > 0

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

### Project Structure
```
├── src/                   # TypeScript source files
│   ├── server.ts          # Main server file
│   ├── types/             # TypeScript interfaces
│   │   └── index.ts
│   ├── models/            # Database models
│   │   ├── Book.ts
│   │   └── Borrow.ts
│   ├── controllers/       # Route controllers
│   │   ├── bookController.ts
│   │   └── borrowController.ts
│   ├── routes/            # API routes
│   │   ├── bookRoutes.ts
│   │   └── borrowRoutes.ts
│   ├── middleware/        # Custom middleware
│   │   └── validation.ts
│   └── utils/             # Utility functions
│       ├── seedData.ts
│       └── test-api.ts
├── dist/                  # Compiled JavaScript (generated)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── config.env             # Environment variables
└── README.md             # Documentation
```

## Testing the API

You can test the API using tools like Postman, curl, or any HTTP client.

### Example curl commands:

```bash
# Get all books
curl http://localhost:5000/api/books

# Create a book
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "isbn": "9780743273565",
    "description": "A story of the fabulously wealthy Jay Gatsby",
    "copies": 3
  }'

# Borrow a book
curl -X POST http://localhost:5000/api/borrows \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "book_id_here",
    "quantity": 1,
    "dueDate": "2024-02-15T00:00:00.000Z"
  }'
```

### Testing the API

You can also run the automated test suite:

```bash
npm run test-api
``` 