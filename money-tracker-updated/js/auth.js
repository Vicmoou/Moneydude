/**
 * Money Tracker - Authentication Module
 * Handles user login and registration using localStorage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Registration form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorElement = document.getElementById('register-error');
        const successElement = document.getElementById('register-success');
        
        // Reset messages
        errorElement.style.display = 'none';
        successElement.style.display = 'none';
        
        // Validation
        if (!username || !password) {
            errorElement.textContent = 'Username and password are required';
            errorElement.style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.display = 'block';
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
        if (users.some(user => user.username === username)) {
            errorElement.textContent = 'Username already exists';
            errorElement.style.display = 'block';
            return;
        }
        
        // Create new user
        const newUser = {
            username: username,
            password: password, // In a real app, this should be hashed
            createdAt: new Date().toISOString(),
            settings: {
                theme: 'light',
                currency: 'Dollar',
                profilePicture: null
            }
        };
        
        users.push(newUser);
        localStorage.setItem('moneyTrackerUsers', JSON.stringify(users));
        
        // Initialize user data
        initializeUserData(username);
        
        // Pre-fill login form with the new username
        document.getElementById('login-username').value = username;
        
        // Show success message
        successElement.textContent = 'Registration successful! You can now login.';
        successElement.style.display = 'block';
        
        // Reset form
        registerForm.reset();
        
        // Switch to login tab after a delay
        setTimeout(() => {
            loginTab.click();
        }, 2000);
    });

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('login-remember').checked;
        const errorElement = document.getElementById('login-error');
        
        // Reset error message
        errorElement.style.display = 'none';
        
        // Validation
        if (!username || !password) {
            errorElement.textContent = 'Username and password are required';
            errorElement.style.display = 'block';
            return;
        }
        
        // Check credentials
        const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
        const user = users.find(user => user.username === username && user.password === password);
        
        if (!user) {
            errorElement.textContent = 'Invalid username or password';
            errorElement.style.display = 'block';
            return;
        }
        
        // Set current user in session storage
        sessionStorage.setItem('currentUser', username);
        
        // If remember me is checked, store in localStorage too
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Check if user data exists, if not initialize it
        if (!localStorage.getItem(`${username}_accounts`)) {
            console.log('Initializing user data for', username);
            initializeUserData(username);
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });

    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('login-username').value = rememberedUser;
        document.getElementById('login-remember').checked = true;
    }

    // Initialize user data function
    function initializeUserData(username) {
        // Create initial data structures for the new user
        
        // Accounts
        const accounts = [
            {
                id: generateId(),
                name: 'Cash',
                balance: 0,
                icon: 'default-cash',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Bank Account',
                balance: 0,
                icon: 'default-bank',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(`${username}_accounts`, JSON.stringify(accounts));
        
        // Categories
        const categories = [
            // Income categories
            {
                id: generateId(),
                name: 'Salary',
                type: 'income',
                icon: 'default-salary',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Gift',
                type: 'income',
                icon: 'default-gift',
                createdAt: new Date().toISOString()
            },
            // Expense categories
            {
                id: generateId(),
                name: 'Food',
                type: 'expense',
                icon: 'default-food',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Transport',
                type: 'expense',
                icon: 'default-transport',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Shopping',
                type: 'expense',
                icon: 'default-shopping',
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Bills',
                type: 'expense',
                icon: 'default-bills',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(`${username}_categories`, JSON.stringify(categories));
        
        // Empty transactions array
        localStorage.setItem(`${username}_transactions`, JSON.stringify([]));
        
        // Empty shopping list
        localStorage.setItem(`${username}_shopping_list`, JSON.stringify([]));
        
        // Empty budgets
        localStorage.setItem(`${username}_budgets`, JSON.stringify([]));
        
        // Empty debts and loans
        localStorage.setItem(`${username}_debts_loans`, JSON.stringify([]));
    }

    // Helper function to generate unique IDs
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
});
