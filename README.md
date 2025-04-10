# Library Management System

A web-based library management system that allows administrators to manage books and users. The system includes features for tracking book borrowing, user management, and importing books from the Open Library database.

## Features

- User Management
  - View all users
  - Activate/deactivate users
  - View user borrowing history
  - Search users

- Book Management
  - Add books manually
  - Import books from Open Library
  - Track book status (available/borrowed)
  - View borrowing history
  - Search books

- Authentication
  - User login/logout
  - Role-based access (admin/user)
  - Session management

## Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd library-management-system
```

2. Create a new repository on GitHub:
   - Go to GitHub.com and create a new repository
   - Name it "library-management-system" or your preferred name
   - Make it public
   - Don't initialize it with any files

3. Initialize the local repository and push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

4. Enable GitHub Pages:
   - Go to your repository settings
   - Scroll down to "GitHub Pages" section
   - Select "main" branch as source
   - Click Save

5. Your site will be available at:
```
https://<your-username>.github.io/library-management-system/
```

## Local Development

To run the application locally:

1. Install a local server (e.g., Live Server in VS Code or Python's HTTP server):
```bash
# Using Python 3
python -m http.server 8000
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

## Usage

1. Admin Access:
   - Login with admin credentials
   - Navigate to the admin dashboard
   - Manage users and books
   - Import books from Open Library
   - Track borrowing history

2. User Access:
   - Login with user credentials
   - View available books
   - View borrowing history

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Local Storage for data persistence
- Open Library API for book imports
- GitHub Pages for hosting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
