import axios from 'axios';
import { IBook } from './app/types';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testBook: Partial<IBook> = {
  title: "Test Book",
  author: "Test Author",
  genre: "Test Genre",
  isbn: "1234567890",
  description: "This is a test book for API testing",
  copies: 3
};

let createdBookId: string;
let createdBorrowId: string;

const testAPI = async (): Promise<void> => {
  try {
    console.log('🚀 Starting API Tests...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message, '\n');

    // Test 2: Get all books (should be empty initially)
    console.log('2. Testing get all books...');
    const booksResponse = await axios.get(`${BASE_URL}/books`);
    console.log('✅ Get books passed. Total books:', booksResponse.data.data.length, '\n');

    // Test 3: Create a book
    console.log('3. Testing create book...');
    const createResponse = await axios.post(`${BASE_URL}/books`, testBook);
    createdBookId = createResponse.data.data._id;
    console.log('✅ Create book passed. Book ID:', createdBookId, '\n');

    // Test 4: Get book by ID
    console.log('4. Testing get book by ID...');
    const getBookResponse = await axios.get(`${BASE_URL}/books/${createdBookId}`);
    console.log('✅ Get book by ID passed. Title:', getBookResponse.data.data.title, '\n');

    // Test 5: Update book
    console.log('5. Testing update book...');
    const updateData = { ...testBook, title: "Updated Test Book" };
    const updateResponse = await axios.put(`${BASE_URL}/books/${createdBookId}`, updateData);
    console.log('✅ Update book passed. Updated title:', updateResponse.data.data.title, '\n');

    // Test 6: Borrow a book
    console.log('6. Testing borrow book...');
    const borrowData = {
      bookId: createdBookId,
      quantity: 1,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    const borrowResponse = await axios.post(`${BASE_URL}/borrows`, borrowData);
    createdBorrowId = borrowResponse.data.data._id;
    console.log('✅ Borrow book passed. Borrow ID:', createdBorrowId, '\n');

    // Test 7: Get borrow summary
    console.log('7. Testing get borrow summary...');
    const summaryResponse = await axios.get(`${BASE_URL}/borrows/summary`);
    console.log('✅ Get borrow summary passed. Total borrowed books:', summaryResponse.data.data.length, '\n');

    // Test 8: Get all borrows
    console.log('8. Testing get all borrows...');
    const borrowsResponse = await axios.get(`${BASE_URL}/borrows`);
    console.log('✅ Get all borrows passed. Total borrows:', borrowsResponse.data.data.length, '\n');

    // Test 9: Return books
    console.log('9. Testing return books...');
    const returnResponse = await axios.put(`${BASE_URL}/borrows/${createdBorrowId}/return`);
    console.log('✅ Return books passed. Status:', returnResponse.data.data.status, '\n');

    // Test 10: Delete borrow record
    console.log('10. Testing delete borrow record...');
    await axios.delete(`${BASE_URL}/borrows/${createdBorrowId}`);
    console.log('✅ Delete borrow record passed.\n');

    // Test 11: Delete book
    console.log('11. Testing delete book...');
    await axios.delete(`${BASE_URL}/books/${createdBookId}`);
    console.log('✅ Delete book passed.\n');

    console.log('🎉 All API tests passed successfully!');

  } catch (error: any) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

export { testAPI }; 