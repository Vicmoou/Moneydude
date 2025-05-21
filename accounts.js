/**
 * Money Tracker - Accounts JavaScript
 * Handles accounts functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize accounts data
    updateAccountsData();
    
    // Set up account modal
    setupAccountModal();
    
    // Set up transfer form
    setupTransferForm();
});

/**
 * Update accounts data and display
 */
function updateAccountsData() {
    // Update total balance
    updateTotalBalance();
    
    // Update accounts list
    updateAccountsList();
    
    // Update transfer form dropdowns
    updateTransferDropdowns();
}

/**
 * Update total balance display
 */
function updateTotalBalance() {
    const totalBalanceElement = document.getElementById('total-balance');
    
    if (!totalBalanceElement) return;
    
    // Calculate total balance
    const totalBalance = calculateTotalBalance();
    totalBalanceElement.textContent = formatCurrency(totalBalance);
}

/**
 * Update accounts list
 */
function updateAccountsList() {
    const accountsContainer = document.getElementById('accounts-container');
    
    if (!accountsContainer) return;
    
    const accounts = getUserData('accounts');
    
    // Clear container
    accountsContainer.innerHTML = '';
    
    if (accounts.length === 0) {
        accountsContainer.innerHTML = '<div class="col-12"><p class="text-muted text-center">No accounts added yet</p></div>';
        return;
    }
    
    // Add accounts
    accounts.forEach(account => {
        const accountCard = document.createElement('div');
        accountCard.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
        
        accountCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="account-card">
                        <div class="account-icon">
                            ${account.icon && account.icon.startsWith('data:') 
                                ? `<img src="${account.icon}" alt="${account.name}">`
                                : `<i class="fas fa-wallet"></i>`}
                        </div>
                        <div class="account-details">
                            <div class="account-name">${account.name}</div>
                            <div class="account-balance">${formatCurrency(account.balance)}</div>
                        </div>
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline edit-account-btn" data-id="${account.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-account-btn" data-id="${account.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        accountsContainer.appendChild(accountCard);
    });
    
    // Add event listeners to edit buttons
    const editButtons = document.querySelectorAll('.edit-account-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            openEditAccountModal(accountId);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-account-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const accountId = this.getAttribute('data-id');
            deleteAccount(accountId);
        });
    });
}

/**
 * Set up account modal
 */
function setupAccountModal() {
    const addAccountBtn = document.getElementById('add-account-btn');
    const accountModal = document.getElementById('account-modal');
    const closeAccountModal = document.getElementById('close-account-modal');
    const cancelAccount = document.getElementById('cancel-account');
    const saveAccount = document.getElementById('save-account');
    const accountForm = document.getElementById('account-form');
    const accountIcon = document.getElementById('account-icon');
    const accountIconPreview = document.getElementById('account-icon-preview');
    const accountIconImg = document.getElementById('account-icon-img');
    
    if (!addAccountBtn || !accountModal || !closeAccountModal || 
        !cancelAccount || !saveAccount || !accountForm || 
        !accountIcon || !accountIconPreview || !accountIconImg) return;
    
    // Show modal when add account button is clicked
    addAccountBtn.addEventListener('click', function() {
        // Reset form
        accountForm.reset();
        document.getElementById('account-id').value = '';
        document.getElementById('account-modal-title').textContent = 'Add Account';
        accountIconPreview.style.display = 'none';
        
        // Show modal
        showModal('account-modal');
    });
    
    // Hide modal when close button is clicked
    closeAccountModal.addEventListener('click', function() {
        hideModal('account-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelAccount.addEventListener('click', function() {
        hideModal('account-modal');
    });
    
    // Handle icon upload
    accountIcon.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                accountIconImg.src = e.target.result;
                accountIconPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            accountIconPreview.style.display = 'none';
        }
    });
    
    // Save account
    saveAccount.addEventListener('click', async function() {
        // Validate form
        if (!accountForm.checkValidity()) {
            accountForm.reportValidity();
            return;
        }
        
        // Get form values
        const accountId = document.getElementById('account-id').value;
        const name = document.getElementById('account-name').value;
        const balance = parseFloat(document.getElementById('account-balance').value);
        
        // Handle icon
        let iconBase64 = null;
        if (accountIcon.files.length > 0) {
            try {
                iconBase64 = await imageToBase64(accountIcon.files[0]);
            } catch (error) {
                console.error('Error converting image to base64:', error);
            }
        } else if (accountIconPreview.style.display !== 'none') {
            // Keep existing icon
            iconBase64 = accountIconImg.src;
        }
        
        // Get accounts
        const accounts = getUserData('accounts');
        
        if (accountId) {
            // Edit existing account
            const accountIndex = accounts.findIndex(a => a.id === accountId);
            
            if (accountIndex !== -1) {
                // Get old balance to calculate difference
                const oldBalance = accounts[accountIndex].balance;
                const balanceDifference = balance - oldBalance;
                
                // Update account
                accounts[accountIndex].name = name;
                accounts[accountIndex].balance = balance;
                if (iconBase64) {
                    accounts[accountIndex].icon = iconBase64;
                }
                
                // Save accounts
                saveUserData('accounts', accounts);
                
                // If balance changed, add a balance adjustment transaction
                if (balanceDifference !== 0) {
                    addBalanceAdjustmentTransaction(accountId, balanceDifference);
                }
            }
        } else {
            // Create new account
            const newAccount = {
                id: generateId(),
                name: name,
                balance: balance,
                icon: iconBase64,
                createdAt: new Date().toISOString()
            };
            
            // Add account
            accounts.push(newAccount);
            
            // Save accounts
            saveUserData('accounts', accounts);
            
            // Add initial balance transaction if balance > 0
            if (balance > 0) {
                addInitialBalanceTransaction(newAccount.id, balance);
            }
        }
        
        // Update accounts data
        updateAccountsData();
        
        // Hide modal
        hideModal('account-modal');
    });
}

/**
 * Open edit account modal
 * @param {string} accountId - Account ID to edit
 */
function openEditAccountModal(accountId) {
    const accounts = getUserData('accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return;
    
    // Set form values
    document.getElementById('account-id').value = account.id;
    document.getElementById('account-name').value = account.name;
    document.getElementById('account-balance').value = account.balance;
    document.getElementById('account-modal-title').textContent = 'Edit Account';
    
    // Set icon preview if exists
    if (account.icon) {
        document.getElementById('account-icon-img').src = account.icon;
        document.getElementById('account-icon-preview').style.display = 'block';
    } else {
        document.getElementById('account-icon-preview').style.display = 'none';
    }
    
    // Show modal
    showModal('account-modal');
}

/**
 * Delete account
 * @param {string} accountId - Account ID to delete
 */
function deleteAccount(accountId) {
    // Check if account has transactions
    const transactions = getUserData('transactions');
    const hasTransactions = transactions.some(t => t.accountId === accountId);
    
    if (hasTransactions) {
        alert('Cannot delete account with transactions. Please delete or move transactions first.');
        return;
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this account?')) {
        return;
    }
    
    // Get accounts
    const accounts = getUserData('accounts');
    
    // Remove account
    const updatedAccounts = accounts.filter(a => a.id !== accountId);
    
    // Save accounts
    saveUserData('accounts', updatedAccounts);
    
    // Update accounts data
    updateAccountsData();
}

/**
 * Add initial balance transaction
 * @param {string} accountId - Account ID
 * @param {number} amount - Initial balance amount
 */
function addInitialBalanceTransaction(accountId, amount) {
    // Get categories
    const categories = getUserData('categories');
    
    // Find or create initial balance category
    let initialBalanceCategory = categories.find(c => c.name === 'Initial Balance' && c.type === 'income');
    
    if (!initialBalanceCategory) {
        initialBalanceCategory = {
            id: generateId(),
            name: 'Initial Balance',
            type: 'income',
            icon: null,
            createdAt: new Date().toISOString()
        };
        
        categories.push(initialBalanceCategory);
        saveUserData('categories', categories);
    }
    
    // Create transaction
    const transaction = {
        id: generateId(),
        type: 'income',
        amount: amount,
        categoryId: initialBalanceCategory.id,
        accountId: accountId,
        date: new Date().toISOString().split('T')[0],
        description: 'Initial Balance',
        includeInReports: true,
        createdAt: new Date().toISOString()
    };
    
    // Add transaction
    const transactions = getUserData('transactions');
    transactions.push(transaction);
    saveUserData('transactions', transactions);
}

/**
 * Add balance adjustment transaction
 * @param {string} accountId - Account ID
 * @param {number} amount - Adjustment amount (positive or negative)
 */
function addBalanceAdjustmentTransaction(accountId, amount) {
    // Get categories
    const categories = getUserData('categories');
    
    // Determine transaction type
    const type = amount >= 0 ? 'income' : 'expense';
    
    // Find or create balance adjustment category
    let adjustmentCategory = categories.find(c => c.name === 'Balance Adjustment' && c.type === type);
    
    if (!adjustmentCategory) {
        adjustmentCategory = {
            id: generateId(),
            name: 'Balance Adjustment',
            type: type,
            icon: null,
            createdAt: new Date().toISOString()
        };
        
        categories.push(adjustmentCategory);
        saveUserData('categories', categories);
    }
    
    // Create transaction
    const transaction = {
        id: generateId(),
        type: type,
        amount: Math.abs(amount),
        categoryId: adjustmentCategory.id,
        accountId: accountId,
        date: new Date().toISOString().split('T')[0],
        description: 'Balance Adjustment',
        includeInReports: false,
        createdAt: new Date().toISOString()
    };
    
    // Add transaction
    const transactions = getUserData('transactions');
    transactions.push(transaction);
    saveUserData('transactions', transactions);
}

/**
 * Update transfer form dropdowns
 */
function updateTransferDropdowns() {
    const transferFrom = document.getElementById('transfer-from');
    const transferTo = document.getElementById('transfer-to');
    
    if (!transferFrom || !transferTo) return;
    
    const accounts = getUserData('accounts');
    
    // Clear dropdowns
    transferFrom.innerHTML = '';
    transferTo.innerHTML = '';
    
    // Add options
    accounts.forEach(account => {
        const fromOption = document.createElement('option');
        fromOption.value = account.id;
        fromOption.textContent = `${account.name} (${formatCurrency(account.balance)})`;
        transferFrom.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = account.id;
        toOption.textContent = account.name;
        transferTo.appendChild(toOption);
    });
}

/**
 * Set up transfer form
 */
function setupTransferForm() {
    const transferForm = document.getElementById('transfer-form');
    
    if (!transferForm) return;
    
    transferForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const fromAccountId = document.getElementById('transfer-from').value;
        const toAccountId = document.getElementById('transfer-to').value;
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const description = document.getElementById('transfer-description').value || 'Transfer';
        
        // Validate
        if (fromAccountId === toAccountId) {
            alert('Cannot transfer to the same account');
            return;
        }
        
        // Get accounts
        const accounts = getUserData('accounts');
        const fromAccount = accounts.find(a => a.id === fromAccountId);
        
        if (!fromAccount) return;
        
        // Check if enough balance
        if (fromAccount.balance < amount) {
            alert('Not enough balance in the source account');
            return;
        }
        
        // Create transfer transactions
        createTransferTransactions(fromAccountId, toAccountId, amount, description);
        
        // Update accounts data
        updateAccountsData();
        
        // Reset form
        transferForm.reset();
        
        // Show success message
        alert('Transfer completed successfully');
    });
}

/**
 * Create transfer transactions
 * @param {string} fromAccountId - Source account ID
 * @param {string} toAccountId - Destination account ID
 * @param {number} amount - Transfer amount
 * @param {string} description - Transfer description
 */
function createTransferTransactions(fromAccountId, toAccountId, amount, description) {
    // Get categories
    const categories = getUserData('categories');
    
    // Find or create transfer category
    let transferCategory = categories.find(c => c.name === 'Transfer');
    
    if (!transferCategory) {
        transferCategory = {
            id: generateId(),
            name: 'Transfer',
            type: 'expense', // Type doesn't matter for transfers
            icon: null,
            createdAt: new Date().toISOString()
        };
        
        categories.push(transferCategory);
        saveUserData('categories', categories);
    }
    
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Create withdrawal transaction
    const withdrawalTransaction = {
        id: generateId(),
        type: 'expense',
        amount: amount,
        categoryId: transferCategory.id,
        accountId: fromAccountId,
        date: today,
        description: `${description} (Transfer Out)`,
        includeInReports: false,
        createdAt: now,
        transferId: generateId(), // Same transfer ID to link both transactions
        transferType: 'out',
        transferAccountId: toAccountId
    };
    
    // Create deposit transaction
    const depositTransaction = {
        id: generateId(),
        type: 'income',
        amount: amount,
        categoryId: transferCategory.id,
        accountId: toAccountId,
        date: today,
        description: `${description} (Transfer In)`,
        includeInReports: false,
        createdAt: now,
        transferId: withdrawalTransaction.transferId, // Same transfer ID to link both transactions
        transferType: 'in',
        transferAccountId: fromAccountId
    };
    
    // Add transactions
    const transactions = getUserData('transactions');
    transactions.push(withdrawalTransaction, depositTransaction);
    saveUserData('transactions', transactions);
    
    // Update account balances
    updateAccountBalance(fromAccountId, -amount);
    updateAccountBalance(toAccountId, amount);
}
