import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import bookRoutes from './routes/bookRoutes';
import borrowRoutes from './routes/borrowRoutes';

// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env['PORT'] || 5000;

// =Middleware=
app.use(helmet());
// app.use(cors());
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true, // optional: if you're using cookies/auth headers
}));
// const whitelist = ['http://localhost:5173', 'http://example2.com', "https://dlnk.one/e?id=AvBn5kAdw4PN&type=1"];
// const corsOptions = {
//   origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
//     if (whitelist.indexOf(origin || '') !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };
app.use(express.json());

// Database connection
mongoose.connect(process.env['MONGODB_URI']!)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Library Management API is running' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 