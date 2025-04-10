const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const BOOKS_FILE = path.join(__dirname, 'books.json');
const HISTORY_FILE = path.join(__dirname, 'history.json');

// Initialize books.json if it doesn't exist
if (!fs.existsSync(BOOKS_FILE)) {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify([]));
}

// Initialize history.json if it doesn't exist
if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// Helper function to read books
function readBooks() {
    return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
}

// Helper function to write books
function writeBooks(books) {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

// Helper function to read history
function readHistory() {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
}

// Helper function to write history
function writeHistory(history) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Get all books
app.get('/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

// Get user history
app.get('/history/:username', (req, res) => {
    const history = readHistory();
    const userHistory = history.filter(record => record.username === req.params.username);
    res.json(userHistory);
});

// Add a new book (admin only)
app.post('/books', (req, res) => {
    const books = readBooks();
    const newBook = {
        id: Date.now(),
        title: req.body.title,
        author: req.body.author,
        isBorrowed: false,
        borrower: null,
        borrowDate: null
    };
    books.push(newBook);
    writeBooks(books);
    res.json(newBook);
});

// Toggle borrow status
app.put('/books/:id', (req, res) => {
    const books = readBooks();
    const history = readHistory();
    const book = books.find(b => b.id === parseInt(req.params.id));
    
    if (book) {
        const username = req.body.username;
        
        if (book.isBorrowed) {
            // Return book
            book.isBorrowed = false;
            book.borrower = null;
            book.borrowDate = null;
            
            // Add return record to history
            history.push({
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                username: username,
                action: 'return',
                date: new Date().toISOString()
            });
        } else {
            // Borrow book
            book.isBorrowed = true;
            book.borrower = username;
            book.borrowDate = new Date().toISOString();
            
            // Add borrow record to history
            history.push({
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                username: username,
                action: 'borrow',
                date: new Date().toISOString()
            });
        }
        
        writeBooks(books);
        writeHistory(history);
        res.json(book);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

// Delete a book (admin only)
app.delete('/books/:id', (req, res) => {
    const books = readBooks();
    const filteredBooks = books.filter(b => b.id !== parseInt(req.params.id));
    writeBooks(filteredBooks);
    res.json({ message: 'Book deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 