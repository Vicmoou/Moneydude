/**
 * Money Tracker - Profile JavaScript
 * Handles profile functionality and settings
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile data
    updateProfileData();
    
    // Set up profile form
    setupProfileForm();
    
    // Set up theme selector
    setupThemeSelector();
    
    // Set up currency selector
    setupCurrencySelector();
    
    // Set up profile picture upload
    setupProfilePictureUpload();
    
    // Set up data export
    setupDataExport();
    
    // Set up data import
    setupDataImport();
    
    // Set up data reset
    setupDataReset();
});

/**
 * Update profile data
 */
function updateProfileData() {
    const profileImage = document.getElementById('profile-image');
    const profileName = document.getElementById('profile-name');
    const profileJoined = document.getElementById('profile-joined');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    
    if (!profileImage || !profileName || !profileJoined || !profileUsername || !profileEmail) return;
    
    // Get current user
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
    const user = users.find(u => u.username === currentUser);
    
    if (!user) return;
    
    // Get user profile or initialize it
    let profile = getUserData('profile');
    if (!Array.isArray(profile) || profile.length === 0) {
        profile = {
            username: currentUser,
            email: '',
            joinedAt: user.createdAt,
            theme: user.settings.theme || 'light',
            currency: user.settings.currency || 'Dollar',
            picture: user.settings.profilePicture || null
        };
    }
    
    // Update profile elements
    if (profile.picture) {
        profileImage.src = profile.picture;
    }
    
    profileName.textContent = profile.username || currentUser;
    profileUsername.value = profile.username || currentUser;
    profileEmail.value = profile.email || '';
    
    // Format joined date
    if (profile.joinedAt) {
        const joinedDate = new Date(profile.joinedAt);
        profileJoined.textContent = `Joined: ${joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    } else {
        profileJoined.textContent = 'Joined: Today';
    }
    
    // Set theme from user settings
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = user.settings.theme || 'light';
    }
    
    // Set currency from user settings
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = user.settings.currency || 'Dollar';
    }
}

/**
 * Set up profile form
 */
function setupProfileForm() {
    const profileForm = document.getElementById('profile-form');
    
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('profile-username').value;
        const email = document.getElementById('profile-email').value;
        
        // Get user profile
        const profile = getUserData('profile');
        
        // Update profile
        profile.username = username;
        profile.email = email;
        
        // Save profile
        saveUserData('profile', profile);
        
        // Update profile data
        updateProfileData();
        
        // Show success message
        alert('Profile updated successfully');
    });
}

/**
 * Set up theme selector
 */
function setupThemeSelector() {
    const themeSelect = document.getElementById('theme-select');
    
    if (!themeSelect) return;
    
    // Get current user
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) return;
    
    // Set initial theme
    const theme = users[userIndex].settings.theme || 'light';
    applyTheme(theme);
    
    themeSelect.addEventListener('change', function() {
        const theme = this.value;
        
        // Update user settings in localStorage
        users[userIndex].settings.theme = theme;
        localStorage.setItem('moneyTrackerUsers', JSON.stringify(users));
        
        // Apply theme
        applyTheme(theme);
    });
}

/**
 * Apply theme to the website
 * @param {string} theme - Theme name
 */
function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
}

/**
 * Set up currency selector
 */
function setupCurrencySelector() {
    const currencySelect = document.getElementById('currency-select');
    
    if (!currencySelect) return;
    
    // Get current user
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) return;
    
    currencySelect.addEventListener('change', function() {
        const currency = this.value;
        
        // Update user settings in localStorage
        users[userIndex].settings.currency = currency;
        localStorage.setItem('moneyTrackerUsers', JSON.stringify(users));
        
        // Update currency format
        updateCurrencyFormat(currency);
    });
}

/**
 * Update currency format
 * @param {string} currency - Currency name
 */
function updateCurrencyFormat(currency) {
    // Update currency format in localStorage
    localStorage.setItem('currency', currency);
    
    // Refresh page to apply changes
    alert('Currency updated. The page will refresh to apply changes.');
    window.location.reload();
}

/**
 * Set up profile picture upload
 */
function setupProfilePictureUpload() {
    const profilePictureUpload = document.getElementById('profile-picture-upload');
    
    if (!profilePictureUpload) return;
    
    // Get current user
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('moneyTrackerUsers') || '[]');
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) return;
    
    profilePictureUpload.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageData = e.target.result;
                
                // Update user settings in localStorage
                users[userIndex].settings.profilePicture = imageData;
                localStorage.setItem('moneyTrackerUsers', JSON.stringify(users));
                
                // Update profile image
                document.getElementById('profile-image').src = imageData;
            };
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Set up data export
 */
function setupDataExport() {
    const exportDataBtn = document.getElementById('export-data');
    
    if (!exportDataBtn) return;
    
    exportDataBtn.addEventListener('click', function() {
        // Get all user data
        const userData = {
            profile: getUserData('profile'),
            accounts: getUserData('accounts'),
            categories: getUserData('categories'),
            transactions: getUserData('transactions'),
            shopping_list: getUserData('shopping_list'),
            budgets: getUserData('budgets')
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(userData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'money_tracker_data.json';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

/**
 * Set up data import
 */
function setupDataImport() {
    const importDataFile = document.getElementById('import-data-file');
    const importDataBtn = document.getElementById('import-data');
    
    if (!importDataFile || !importDataBtn) return;
    
    importDataFile.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            importDataBtn.disabled = false;
        } else {
            importDataBtn.disabled = true;
        }
    });
    
    importDataBtn.addEventListener('click', function() {
        const file = importDataFile.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate imported data
                    if (!importedData.profile || !importedData.accounts || 
                        !importedData.categories || !importedData.transactions) {
                        throw new Error('Invalid data format');
                    }
                    
                    // Confirm import
                    if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                        // Import data
                        saveUserData('profile', importedData.profile);
                        saveUserData('accounts', importedData.accounts);
                        saveUserData('categories', importedData.categories);
                        saveUserData('transactions', importedData.transactions);
                        saveUserData('shopping_list', importedData.shopping_list || []);
                        saveUserData('budgets', importedData.budgets || []);
                        
                        // Show success message
                        alert('Data imported successfully. The page will refresh to apply changes.');
                        
                        // Refresh page
                        window.location.reload();
                    }
                } catch (error) {
                    alert('Error importing data: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        }
    });
}

/**
 * Set up data reset
 */
function setupDataReset() {
    const resetDataBtn = document.getElementById('reset-data');
    
    if (!resetDataBtn) return;
    
    resetDataBtn.addEventListener('click', function() {
        // Confirm reset
        if (confirm('This will delete all your data and cannot be undone. Are you sure you want to continue?')) {
            if (confirm('Are you REALLY sure? All your financial data will be permanently deleted.')) {
                // Reset data
                initializeUserData();
                
                // Show success message
                alert('All data has been reset. The page will refresh.');
                
                // Redirect to login page
                window.location.href = 'index.html';
            }
        }
    });
}
