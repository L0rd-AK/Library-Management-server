import dotenv from 'dotenv';
import { connectDB } from './app/utils/database';
import Book from './app/models/Book';

// Load environment variables
dotenv.config({ path: '.env' });

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const bookCount = await Book.countDocuments().maxTimeMS(10000);
    console.log(`✅ Found ${bookCount} books in database`);
    
    // Test a find query
    const books = await Book.find().limit(1).maxTimeMS(10000);
    console.log(`✅ Successfully queried ${books.length} book(s)`);
    
    console.log('🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection(); 