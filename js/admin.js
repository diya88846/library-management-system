let users = [];
let books = [];

// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.replace('login.html');
        return;
    }
    
    // Display admin name
    document.getElementById('admin-name').textContent = currentUser.username;
    
    // Load and display users
    loadUsers();
    loadBooks();
    showSection('users'); // Show users section by default
});

function loadUsers() {
    users = JSON.parse(localStorage.getItem('users')) || [];
    document.getElementById('total-users').textContent = users.length;
    displayUsers(users);
}

function displayUsers(usersToDisplay) {
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';

    usersToDisplay.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${user.active !== false ? 'Active' : 'Inactive'}</td>
            <td class="user-actions">
                <button class="view-btn" onclick="viewUserDetails('${user.username}')">View Details</button>
                <button class="toggle-btn" onclick="toggleUserStatus('${user.username}')">
                    ${user.active !== false ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        `;
        tableBody.appendChild(tr);

        // Add user details section with borrowing history
        const detailsRow = document.createElement('tr');
        detailsRow.innerHTML = `
            <td colspan="4">
                <div class="user-details" id="details-${user.username}">
                    <h4>User Details</h4>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Status:</strong> ${user.active !== false ? 'Active' : 'Inactive'}</p>
                    <p><strong>Last Login:</strong> ${user.lastLogin || 'Never'}</p>
                    
                    <h4>Borrowing History</h4>
                    <ul class="history-list">
                        ${user.borrowHistory ? user.borrowHistory.map(record => `
                            <li>
                                ${record.title} - ${record.action} on ${new Date(record.date).toLocaleDateString()}
                            </li>
                        `).join('') : '<li>No borrowing history</li>'}
                    </ul>
                </div>
            </td>
        `;
        tableBody.appendChild(detailsRow);
    });
}

function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
    );
    displayUsers(filteredUsers);
}

function viewUserDetails(username) {
    const detailsDiv = document.getElementById(`details-${username}`);
    const currentDisplay = detailsDiv.style.display;
    detailsDiv.style.display = currentDisplay === 'block' ? 'none' : 'block';
}

function toggleUserStatus(username) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users[userIndex].active = !users[userIndex].active;
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    }
}

function loadBooks() {
    books = JSON.parse(localStorage.getItem('books')) || [];
    document.getElementById('total-books').textContent = books.length;
    displayBooks(books);
}

function displayBooks(booksToDisplay) {
    const tableBody = document.getElementById('books-table-body');
    tableBody.innerHTML = '';

    booksToDisplay.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td class="book-status-${book.status}">${book.status}</td>
            <td>${book.borrower ? `<span class="borrower-link" onclick="viewUserDetails('${book.borrower}')">${book.borrower}</span>` : '-'}</td>
            <td>${book.borrowDate || '-'}</td>
            <td class="user-actions">
                ${book.status === 'available' ? 
                    `<button class="toggle-btn" onclick="markBookBorrowed('${book.isbn}')">Mark Borrowed</button>` :
                    `<button class="view-btn" onclick="markBookReturned('${book.isbn}')">Mark Returned</button>`
                }
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function addBook() {
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const isbn = document.getElementById('book-isbn').value;

    if (!title || !author || !isbn) {
        alert('Please fill in all fields');
        return;
    }

    if (books.some(book => book.isbn === isbn)) {
        alert('Book with this ISBN already exists!');
        return;
    }

    books.push({
        title,
        author,
        isbn,
        status: 'available',
        history: []
    });

    localStorage.setItem('books', JSON.stringify(books));
    loadBooks();

    // Clear form
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-isbn').value = '';
}

function markBookBorrowed(isbn) {
    const username = prompt('Enter borrower username:');
    if (!username) return;

    const user = users.find(u => u.username === username);
    if (!user) {
        alert('User not found!');
        return;
    }

    const bookIndex = books.findIndex(b => b.isbn === isbn);
    if (bookIndex !== -1) {
        const currentDate = new Date().toISOString();
        books[bookIndex].status = 'borrowed';
        books[bookIndex].borrower = username;
        books[bookIndex].borrowDate = currentDate;
        books[bookIndex].history = books[bookIndex].history || [];
        books[bookIndex].history.push({
            action: 'borrowed',
            username,
            date: currentDate
        });

        // Update user's borrowing history
        const userIndex = users.findIndex(u => u.username === username);
        users[userIndex].borrowHistory = users[userIndex].borrowHistory || [];
        users[userIndex].borrowHistory.push({
            isbn,
            title: books[bookIndex].title,
            action: 'borrowed',
            date: currentDate
        });

        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('users', JSON.stringify(users));
        loadBooks();
    }
}

function markBookReturned(isbn) {
    const bookIndex = books.findIndex(b => b.isbn === isbn);
    if (bookIndex !== -1) {
        const currentDate = new Date().toISOString();
        const username = books[bookIndex].borrower;

        books[bookIndex].history.push({
            action: 'returned',
            username,
            date: currentDate
        });

        // Update user's borrowing history
        const userIndex = users.findIndex(u => u.username === username);
        users[userIndex].borrowHistory.push({
            isbn,
            title: books[bookIndex].title,
            action: 'returned',
            date: currentDate
        });

        books[bookIndex].status = 'available';
        books[bookIndex].borrower = null;
        books[bookIndex].borrowDate = null;

        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('users', JSON.stringify(users));
        loadBooks();
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('book-search').value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.toLowerCase().includes(searchTerm)
    );
    displayBooks(filteredBooks);
}

function showSection(section) {
    document.getElementById('users-section').style.display = section === 'users' ? 'block' : 'none';
    document.getElementById('books-section').style.display = section === 'books' ? 'block' : 'none';
    
    // Update active tab
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase() === section);
    });

    if (section === 'books') {
        loadBooks();
    } else if (section === 'users') {
        loadUsers();
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.replace('login.html');
}

async function searchOpenLibrary() {
    const query = document.getElementById('search-query').value;
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    const resultsDiv = document.getElementById('import-results');
    resultsDiv.innerHTML = 'Searching...';
    resultsDiv.style.display = 'block';

    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=title,author_name,isbn,first_publish_year&limit=20`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            resultsDiv.innerHTML = data.docs.map((book, index) => `
                <div class="import-book-item">
                    <input type="checkbox" class="import-checkbox" data-index="${index}">
                    <div class="import-book-info">
                        <strong>${book.title}</strong><br>
                        Author: ${book.author_name ? book.author_name[0] : 'Unknown'}<br>
                        ISBN: ${book.isbn ? book.isbn[0] : 'N/A'}<br>
                        Year: ${book.first_publish_year || 'N/A'}
                    </div>
                </div>
            `).join('');
        } else {
            resultsDiv.innerHTML = 'No books found';
        }
    } catch (error) {
        resultsDiv.innerHTML = 'Error searching for books';
        console.error('Error:', error);
    }
}

async function importSelectedBooks() {
    const checkboxes = document.querySelectorAll('.import-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Please select books to import');
        return;
    }

    const progressDiv = document.getElementById('import-progress');
    progressDiv.style.display = 'block';

    const searchResults = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(document.getElementById('search-query').value)}&fields=title,author_name,isbn,first_publish_year&limit=20`)
        .then(res => res.json())
        .then(data => data.docs);

    for (const checkbox of checkboxes) {
        const bookData = searchResults[parseInt(checkbox.dataset.index)];
        
        // Skip if book with this ISBN already exists
        if (bookData.isbn && books.some(b => b.isbn === bookData.isbn[0])) {
            continue;
        }

        const newBook = {
            title: bookData.title,
            author: bookData.author_name ? bookData.author_name[0] : 'Unknown',
            isbn: bookData.isbn ? bookData.isbn[0] : `OL${Date.now()}`, // Generate a unique ID if no ISBN
            status: 'available',
            history: []
        };

        books.push(newBook);
    }

    localStorage.setItem('books', JSON.stringify(books));
    loadBooks();

    // Clear import section
    document.getElementById('search-query').value = '';
    document.getElementById('import-results').style.display = 'none';
    progressDiv.style.display = 'none';
    
    alert('Selected books have been imported successfully!');
} 