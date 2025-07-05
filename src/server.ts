import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import bookRoutes from './app/routes/bookRoutes';
import borrowRoutes from './app/routes/borrowRoutes';

// Load environment variables
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env['PORT'] || 5000;

// =Middleware=
app.use(helmet());
// app.use(cors());
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost","https://amits-library.vercel.app"],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
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

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
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

// Only start the server if not in a serverless environment
// if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  async function main() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management');
      console.log("Connected to MongoDB Using Mongoose!!");
      const server = app.listen(PORT, () => {
        console.log(`App is listening on port ${PORT}`);
      });
    } catch (error) {
      console.log(error);
    }
  }

  main();
// }

// Export the app for Vercel
export default app; 