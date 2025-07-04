import mongoose from 'mongoose';
import Book from '../models/Book';
import { IBook } from '../types';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const sampleBooks: Partial<IBook>[] = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    isbn: "9780743273565",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    copies: 5
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    isbn: "9780446310789",
    description: "The story of young Scout Finch and her father Atticus in a racially divided Alabama town.",
    copies: 3
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Science Fiction",
    isbn: "9780451524935",
    description: "A dystopian novel about totalitarianism and surveillance society.",
    copies: 4
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    isbn: "9780141439518",
    description: "The story of Elizabeth Bennet and Mr. Darcy in early 19th century England.",
    copies: 2
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    isbn: "9780547928241",
    description: "The adventure of Bilbo Baggins, a hobbit who embarks on a quest with thirteen dwarves.",
    copies: 6
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    isbn: "9780316769488",
    description: "The story of Holden Caulfield, a teenager navigating the complexities of growing up.",
    copies: 3
  },
  {
    title: "Lord of the Flies",
    author: "William Golding",
    genre: "Fiction",
    isbn: "9780399501487",
    description: "A group of British boys stranded on an uninhabited island and their descent into savagery.",
    copies: 4
  },
  {
    title: "Animal Farm",
    author: "George Orwell",
    genre: "Political Satire",
    isbn: "9780451526342",
    description: "An allegorical novella about a group of farm animals who rebel against their human farmer.",
    copies: 3
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    isbn: "9780062315007",
    description: "A novel about a young Andalusian shepherd who dreams of finding a worldly treasure.",
    copies: 5
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Science Fiction",
    isbn: "9780060850524",
    description: "A dystopian novel about a futuristic society where people are genetically engineered and conditioned.",
    copies: 2
  }
];

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env['MONGODB_URI']!);
    console.log('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert sample books
    const insertedBooks = await Book.insertMany(sampleBooks);
    console.log(`Successfully inserted ${insertedBooks.length} books`);

    // Display inserted books
    console.log('\nInserted books:');
    insertedBooks.forEach(book => {
      console.log(`- ${book.title} by ${book.author} (${book.copies} copies)`);
    });

    console.log('\nDatabase seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, sampleBooks }; 