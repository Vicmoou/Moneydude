/**
 * Money Tracker - Main JavaScript
 * Contains core functionality and utilities used across the application
 */

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page is index.html (login page)
    const isLoginPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/') || 
                        window.location.pathname === '';
    
    if (!isLoginPage) {
        // Check if user is logged in
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            // Redirect to login page
            window.location.href = 'index.html';
            return;
        }
        
        // Setup sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (sidebarToggle && sidebar && mainContent) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(event) {
                const isMobile = window.innerWidth < 992;
                if (isMobile && sidebar.classList.contains('show') && 
                    !sidebar.contains(event.target) && 
                    !sidebarToggle.contains(event.target)) {
                    sidebar.classList.remove('show');
                }
            });
        }
        
        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
    }
});

/**
 * Currency formatting based on user settings
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return '$' + amount.toFixed(2);
    
    // Get user settings
    const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
    const user = users.find(u => u.username === currentUser);
    
    if (!user) return '$' + amount.toFixed(2);
    
    const currency = user.settings.currency || 'Dollar';
    
    // Format based on currency
    switch(currency) {
        case 'Kwanza':
            return 'Kz ' + amount.toFixed(2);
        case 'Reais':
            return 'R$ ' + amount.toFixed(2);
        case 'Euros':
            return '€' + amount.toFixed(2);
        case 'Dollar':
        default:
            return '$' + amount.toFixed(2);
    }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get user data from localStorage
 * @param {string} key - The key suffix to get data for
 * @returns {Array} - Array of user data
 */
function getUserData(key) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return [];
    
    return JSON.parse(localStorage.getItem(`${currentUser}_${key}`) || '[]');
}

/**
 * Save user data to localStorage
 * @param {string} key - The key suffix to save data for
 * @param {Array} data - The data to save
 */
function saveUserData(key, data) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    localStorage.setItem(`${currentUser}_${key}`, JSON.stringify(data));
}

/**
 * Convert image to base64
 * @param {File} file - The image file
 * @returns {Promise<string>} - Promise resolving to base64 string
 */
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Show a modal
 * @param {string} modalId - The ID of the modal to show
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Hide a modal
 * @param {string} modalId - The ID of the modal to hide
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Calculate total balance across all accounts
 * @returns {number} - Total balance
 */
function calculateTotalBalance() {
    const accounts = getUserData('accounts');
    return accounts.reduce((total, account) => total + account.balance, 0);
}

/**
 * Calculate total income for a given period
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Total income
 */
function calculateTotalIncome(startDate, endDate) {
    const transactions = getUserData('transactions');
    
    return transactions
        .filter(t => t.type === 'income' && 
                    new Date(t.date) >= startDate && 
                    new Date(t.date) <= endDate)
        .reduce((total, t) => total + t.amount, 0);
}

/**
 * Calculate total expenses for a given period
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Total expenses
 */
function calculateTotalExpenses(startDate, endDate) {
    const transactions = getUserData('transactions');
    
    return transactions
        .filter(t => t.type === 'expense' && 
                    new Date(t.date) >= startDate && 
                    new Date(t.date) <= endDate)
        .reduce((total, t) => total + t.amount, 0);
}

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Object|null} - Category object or null if not found
 */
function getCategoryById(categoryId) {
    const categories = getUserData('categories');
    return categories.find(c => c.id === categoryId) || null;
}

/**
 * Get account by ID
 * @param {string} accountId - Account ID
 * @returns {Object|null} - Account object or null if not found
 */
function getAccountById(accountId) {
    const accounts = getUserData('accounts');
    return accounts.find(a => a.id === accountId) || null;
}

/**
 * Update account balance
 * @param {string} accountId - Account ID
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 */
function updateAccountBalance(accountId, amount) {
    const accounts = getUserData('accounts');
    const accountIndex = accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
        accounts[accountIndex].balance += amount;
        saveUserData('accounts', accounts);
    }
}

/**
 * Export user data to JSON
 * @returns {string} - JSON string of all user data
 */
function exportUserData() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return '';
    
    const userData = {
        accounts: getUserData('accounts'),
        categories: getUserData('categories'),
        transactions: getUserData('transactions'),
        shopping_list: getUserData('shopping_list'),
        budgets: getUserData('budgets'),
        debts_loans: getUserData('debts_loans')
    };
    
    return JSON.stringify(userData, null, 2);
}

/**
 * Import user data from JSON
 * @param {string} jsonData - JSON string of user data
 * @returns {boolean} - Success status
 */
function importUserData(jsonData) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    try {
        const userData = JSON.parse(jsonData);
        
        // Validate data structure
        if (!userData.accounts || !userData.categories || 
            !userData.transactions || !userData.shopping_list || 
            !userData.budgets || !userData.debts_loans) {
            return false;
        }
        
        // Import all data
        saveUserData('accounts', userData.accounts);
        saveUserData('categories', userData.categories);
        saveUserData('transactions', userData.transactions);
        saveUserData('shopping_list', userData.shopping_list);
        saveUserData('budgets', userData.budgets);
        saveUserData('debts_loans', userData.debts_loans);
        
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

/**
 * Apply theme based on user settings
 */
function applyTheme() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
    const user = users.find(u => u.username === currentUser);
    
    if (!user) return;
    
    const theme = user.settings.theme || 'light';
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Apply theme when page loads
document.addEventListener('DOMContentLoaded', applyTheme);
