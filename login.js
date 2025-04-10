// Sample users (in a real application, this would be in a database)
let users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
];

// Load users from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    
    // Check if user is already logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        // Redirect based on role if already logged in
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }
});

function toggleAuth(formType) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    
    if (formType === 'login') {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        loginToggle.classList.remove('active');
        signupToggle.classList.add('active');
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (user.active === false) {
            alert('Your account has been deactivated. Please contact an administrator.');
            return;
        }

        // Update last login time
        const userIndex = users.findIndex(u => u.username === username);
        users[userIndex].lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));

        // Store user info in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            role: user.role
        }));
        
        // Redirect based on role
        if (user.role === 'admin') {
            window.location.replace('admin.html');
        } else {
            window.location.replace('index.html');
        }
    } else {
        alert('Invalid username or password!');
    }
}

function signup() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('user-role').value;

    // Validate inputs
    if (!username || !password || !confirmPassword || !role) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    // Add new user with selected role
    users.push({
        username: username,
        password: password,
        role: role
    });

    // Save users to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful! Please login.');
    toggleAuth('login');
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

// Add event listener for Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
        if (activeForm.id === 'login-form') {
            login();
        } else {
            signup();
        }
    }
});

// Function to check if user is logged in and update UI accordingly
function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        updateUIForRole(currentUser.role);
    }
}

// Function to update UI based on user role
function updateUIForRole(role) {
    const roleDisplay = document.getElementById('user-role-display');
    if (roleDisplay) {
        roleDisplay.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }
} 