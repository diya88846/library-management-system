const API_URL = "http://localhost:5000/books";
const HISTORY_URL = "http://localhost:5000/history";

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadBooks();
    setupEventListeners();
    loadUserHistory();
});

function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isLoggedIn) {
        window.location.href = 'login.html';
    }
    
    // Update UI based on user role
    updateUIForRole(currentUser.role);
}

function updateUIForRole(role) {
    const addBookForm = document.querySelector('.form-container');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    if (role === 'admin') {
        // Admin can see everything
        addBookForm.style.display = 'block';
        deleteButtons.forEach(btn => btn.style.display = 'block');
    } else {
        // Regular users can only borrow/return books
        addBookForm.style.display = 'none';
        deleteButtons.forEach(btn => btn.style.display = 'none');
    }
    
    // Display username and role
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span><i class="fas fa-user"></i> ${JSON.parse(sessionStorage.getItem('currentUser')).username}</span>
        <span class="role-badge ${role}"><i class="fas fa-user-tag"></i> ${role}</span>
    `;
    
    document.querySelector('header').appendChild(userInfo);
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function setupEventListeners() {
    // Add book form submission
    const form = document.querySelector('.form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addBook();
    });
}

function loadBooks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(books => {
            displayBooks(books);
        })
        .catch(error => {
            console.error('Error loading books:', error);
            showNotification('Error loading books. Please try again.', 'error');
        });
}

function loadUserHistory() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && currentUser.username) {
        fetch(`${HISTORY_URL}/${currentUser.username}`)
            .then(response => response.json())
            .then(history => {
                displayUserHistory(history);
            })
            .catch(error => {
                console.error('Error loading history:', error);
            });
    }
}

function displayUserHistory(history) {
    const historyContainer = document.createElement('div');
    historyContainer.className = 'history-container';
    historyContainer.innerHTML = `
        <h2>Your Borrowing History</h2>
        <div class="history-list">
            ${history.length > 0 ? history.map(record => `
                <div class="history-item ${record.action}">
                    <div class="history-icon">
                        <i class="fas ${record.action === 'borrow' ? 'fa-book' : 'fa-undo'}"></i>
                    </div>
                    <div class="history-details">
                        <h3>${record.bookTitle}</h3>
                        <p>${record.action === 'borrow' ? 'Borrowed' : 'Returned'} on ${new Date(record.date).toLocaleDateString()}</p>
                    </div>
                </div>
            `).join('') : '<p class="no-history">No borrowing history yet.</p>'}
        </div>
    `;
    
    document.querySelector('.books-container').appendChild(historyContainer);
}

function displayBooks(books) {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    if (books.length === 0) {
        bookList.innerHTML = '<p class="no-books">No books available. Add some books to get started!</p>';
        return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isAdmin = currentUser.role === 'admin';

    books.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        
        const borrowDate = book.borrowDate ? new Date(book.borrowDate).toLocaleDateString() : '';
        const isCurrentUserBorrower = book.borrower === currentUser.username;
        
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p><i class="fas fa-user"></i> ${book.author}</p>
            <div class="book-status ${book.isBorrowed ? 'status-borrowed' : 'status-available'}">
                ${book.isBorrowed ? 'Borrowed' : 'Available'}
            </div>
            ${book.isBorrowed ? `<p><i class="fas fa-calendar"></i> Borrowed on: ${borrowDate}</p>` : ''}
            ${book.isBorrowed ? `<p><i class="fas fa-user"></i> Borrowed by: ${book.borrower}</p>` : ''}
            <div class="book-actions">
                ${(isAdmin || (!book.isBorrowed || isCurrentUserBorrower)) ? 
                    `<button class="borrow-btn" onclick="toggleBorrow(${book.id})">
                        <i class="fas ${book.isBorrowed ? 'fa-undo' : 'fa-book'}"></i>
                        ${book.isBorrowed ? 'Return' : 'Borrow'}
                    </button>` : ''}
                ${isAdmin ? 
                    `<button class="delete-btn" onclick="deleteBook(${book.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>` : ''}
            </div>
        `;
        bookList.appendChild(bookCard);
    });
}

function addBook() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser.role !== 'admin') {
        showNotification('Only admins can add books', 'error');
        return;
    }
    
    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();

    if (!title || !author) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author })
    })
    .then(response => response.json())
    .then(() => {
        loadBooks();
        document.getElementById("book-title").value = "";
        document.getElementById("book-author").value = "";
        showNotification('Book added successfully!', 'success');
    })
    .catch(error => {
        console.error('Error adding book:', error);
        showNotification('Error adding book. Please try again.', 'error');
    });
}

function toggleBorrow(id) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    fetch(`${API_URL}/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username })
    })
    .then(response => response.json())
    .then(book => {
        loadBooks();
        loadUserHistory();
        showNotification(
            book.isBorrowed ? 'Book borrowed successfully!' : 'Book returned successfully!',
            'success'
        );
    })
    .catch(error => {
        console.error('Error toggling borrow status:', error);
        showNotification('Error updating book status. Please try again.', 'error');
    });
}

function deleteBook(id) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser.role !== 'admin') {
        showNotification('Only admins can delete books', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to remove this book?')) {
        return;
    }

    fetch(`${API_URL}/${id}`, { 
        method: "DELETE" 
    })
    .then(() => {
        loadBooks();
        showNotification('Book removed successfully!', 'success');
    })
    .catch(error => {
        console.error('Error deleting book:', error);
        showNotification('Error removing book. Please try again.', 'error');
    });
}

function searchBooks() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const bookCards = document.querySelectorAll(".book-card");

    bookCards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const author = card.querySelector("p").textContent.toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
