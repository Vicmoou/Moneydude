/**
 * Money Tracker - Transactions JavaScript
 * Handles transactions functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize transactions data
    updateTransactionsData();
    
    // Set up transaction modal
    setupTransactionModal();
    
    // Set up filter form
    setupFilterForm();
    
    // Set up sorting
    setupSorting();
    
    // Add transaction button
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', function() {
            openAddTransactionModal();
        });
    }
});

/**
 * Update transactions data and display
 */
function updateTransactionsData() {
    // Populate filter dropdowns
    populateFilterDropdowns();
    
    // Apply current filters
    applyFilters();
}

/**
 * Populate filter dropdowns
 */
function populateFilterDropdowns() {
    // Populate accounts dropdown
    const filterAccount = document.getElementById('filter-account');
    if (filterAccount) {
        const accounts = getUserData('accounts');
        
        // Clear dropdown except first option
        while (filterAccount.options.length > 1) {
            filterAccount.remove(1);
        }
        
        // Add options
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            filterAccount.appendChild(option);
        });
    }
    
    // Populate categories dropdown
    const filterCategory = document.getElementById('filter-category');
    if (filterCategory) {
        const categories = getUserData('categories');
        
        // Clear dropdown except first option
        while (filterCategory.options.length > 1) {
            filterCategory.remove(1);
        }
        
        // Add options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.name} (${category.type})`;
            filterCategory.appendChild(option);
        });
    }
}

/**
 * Set up filter form
 */
function setupFilterForm() {
    const filterForm = document.getElementById('filter-form');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            filterForm.reset();
            applyFilters();
        });
    }
}

/**
 * Set up sorting
 */
function setupSorting() {
    const sortBy = document.getElementById('sort-by');
    
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            applyFilters();
        });
    }
}

/**
 * Apply filters and update transactions list
 */
function applyFilters() {
    // Get filter values
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const type = document.getElementById('filter-type').value;
    const accountId = document.getElementById('filter-account').value;
    const categoryId = document.getElementById('filter-category').value;
    const minAmount = document.getElementById('filter-min-amount').value;
    const maxAmount = document.getElementById('filter-max-amount').value;
    const includeInReports = document.getElementById('filter-include-in-reports').value;
    const search = document.getElementById('filter-search').value.toLowerCase();
    
    // Get sort value
    const sortBy = document.getElementById('sort-by').value;
    
    // Get transactions
    let transactions = getUserData('transactions');
    
    // Apply filters
    if (dateFrom) {
        transactions = transactions.filter(t => t.date >= dateFrom);
    }
    
    if (dateTo) {
        transactions = transactions.filter(t => t.date <= dateTo);
    }
    
    if (type !== 'all') {
        transactions = transactions.filter(t => t.type === type);
    }
    
    if (accountId !== 'all') {
        transactions = transactions.filter(t => t.accountId === accountId);
    }
    
    if (categoryId !== 'all') {
        transactions = transactions.filter(t => t.categoryId === categoryId);
    }
    
    if (minAmount) {
        transactions = transactions.filter(t => t.amount >= parseFloat(minAmount));
    }
    
    if (maxAmount) {
        transactions = transactions.filter(t => t.amount <= parseFloat(maxAmount));
    }
    
    if (includeInReports !== 'all') {
        const include = includeInReports === 'yes';
        transactions = transactions.filter(t => t.includeInReports === include);
    }
    
    if (search) {
        transactions = transactions.filter(t => 
            (t.description && t.description.toLowerCase().includes(search))
        );
    }
    
    // Apply sorting
    transactions.sort((a, b) => {
        switch (sortBy) {
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'amount-asc':
                return a.amount - b.amount;
            case 'amount-desc':
                return b.amount - a.amount;
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    // Update transactions table
    updateTransactionsTable(transactions);
}

/**
 * Update transactions table
 * @param {Array} transactions - Filtered transactions array
 */
function updateTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactions-table-body');
    const noTransactionsMessage = document.getElementById('no-transactions-message');
    
    if (!tableBody || !noTransactionsMessage) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        tableBody.style.display = 'none';
        noTransactionsMessage.style.display = 'block';
        return;
    }
    
    tableBody.style.display = '';
    noTransactionsMessage.style.display = 'none';
    
    // Add transactions to table
    transactions.forEach(transaction => {
        const category = getCategoryById(transaction.categoryId);
        const account = getAccountById(transaction.accountId);
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || '-'}</td>
            <td>${category ? category.name : 'Unknown'}</td>
            <td>${account ? account.name : 'Unknown'}</td>
            <td class="${transaction.type === 'income' ? 'currency-positive' : 'currency-negative'}">
                ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
            </td>
            <td>${transaction.includeInReports ? 'Yes' : 'No'}</td>
            <td>
                <button class="btn btn-sm btn-outline edit-transaction-btn" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-transaction-btn" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    const editButtons = document.querySelectorAll('.edit-transaction-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            openEditTransactionModal(transactionId);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-transaction-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            deleteTransaction(transactionId);
        });
    });
}

/**
 * Set up transaction modal
 */
function setupTransactionModal() {
    const transactionModal = document.getElementById('transaction-modal');
    const closeTransactionModal = document.getElementById('close-transaction-modal');
    const cancelTransaction = document.getElementById('cancel-transaction');
    const saveTransaction = document.getElementById('save-transaction');
    const transactionForm = document.getElementById('transaction-form');
    const transactionType = document.getElementById('transaction-type');
    const transactionCategory = document.getElementById('transaction-category');
    const transactionAccount = document.getElementById('transaction-account');
    const transactionDate = document.getElementById('transaction-date');
    
    if (!transactionModal || !closeTransactionModal || !cancelTransaction || 
        !saveTransaction || !transactionForm || !transactionType || 
        !transactionCategory || !transactionAccount || !transactionDate) return;
    
    // Hide modal when close button is clicked
    closeTransactionModal.addEventListener('click', function() {
        hideModal('transaction-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelTransaction.addEventListener('click', function() {
        hideModal('transaction-modal');
    });
    
    // Handle transaction type change
    transactionType.addEventListener('change', function() {
        populateCategoriesDropdown();
    });
    
    // Save transaction
    saveTransaction.addEventListener('click', function() {
        // Validate form
        if (!transactionForm.checkValidity()) {
            transactionForm.reportValidity();
            return;
        }
        
        // Get form values
        const transactionId = document.getElementById('transaction-id').value;
        const type = transactionType.value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const categoryId = transactionCategory.value;
        const accountId = transactionAccount.value;
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;
        const includeInReports = document.getElementById('transaction-include-in-reports').checked;
        
        // Get transactions
        const transactions = getUserData('transactions');
        
        if (transactionId) {
            // Edit existing transaction
            const transactionIndex = transactions.findIndex(t => t.id === transactionId);
            
            if (transactionIndex !== -1) {
                const oldTransaction = transactions[transactionIndex];
                
                // Revert old transaction effect on account balance
                if (oldTransaction.type === 'income') {
                    updateAccountBalance(oldTransaction.accountId, -oldTransaction.amount);
                } else {
                    updateAccountBalance(oldTransaction.accountId, oldTransaction.amount);
                }
                
                // Update transaction
                transactions[transactionIndex] = {
                    ...oldTransaction,
                    type: type,
                    amount: amount,
                    categoryId: categoryId,
                    accountId: accountId,
                    date: date,
                    description: description,
                    includeInReports: includeInReports
                };
                
                // Apply new transaction effect on account balance
                if (type === 'income') {
                    updateAccountBalance(accountId, amount);
                } else {
                    updateAccountBalance(accountId, -amount);
                }
            }
        } else {
            // Create new transaction
            const newTransaction = {
                id: generateId(),
                type: type,
                amount: amount,
                categoryId: categoryId,
                accountId: accountId,
                date: date,
                description: description,
                includeInReports: includeInReports,
                createdAt: new Date().toISOString()
            };
            
            // Add transaction
            transactions.push(newTransaction);
            
            // Update account balance
            if (type === 'income') {
                updateAccountBalance(accountId, amount);
            } else {
                updateAccountBalance(accountId, -amount);
            }
        }
        
        // Save transactions
        saveUserData('transactions', transactions);
        
        // Update transactions data
        updateTransactionsData();
        
        // Hide modal
        hideModal('transaction-modal');
    });
}

/**
 * Open add transaction modal
 */
function openAddTransactionModal() {
    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('transaction-id').value = '';
    document.getElementById('transaction-modal-title').textContent = 'Add Transaction';
    
    // Set default date to today
    document.getElementById('transaction-date').valueAsDate = new Date();
    
    // Populate categories dropdown
    populateCategoriesDropdown();
    
    // Populate accounts dropdown
    populateAccountsDropdown();
    
    // Show modal
    showModal('transaction-modal');
}

/**
 * Open edit transaction modal
 * @param {string} transactionId - Transaction ID to edit
 */
function openEditTransactionModal(transactionId) {
    const transactions = getUserData('transactions');
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) return;
    
    // Set form values
    document.getElementById('transaction-id').value = transaction.id;
    document.getElementById('transaction-type').value = transaction.type;
    document.getElementById('transaction-amount').value = transaction.amount;
    document.getElementById('transaction-date').value = transaction.date;
    document.getElementById('transaction-description').value = transaction.description || '';
    document.getElementById('transaction-include-in-reports').checked = transaction.includeInReports;
    document.getElementById('transaction-modal-title').textContent = 'Edit Transaction';
    
    // Populate categories dropdown
    populateCategoriesDropdown();
    
    // Populate accounts dropdown
    populateAccountsDropdown();
    
    // Set selected category and account
    document.getElementById('transaction-category').value = transaction.categoryId;
    document.getElementById('transaction-account').value = transaction.accountId;
    
    // Show modal
    showModal('transaction-modal');
}

/**
 * Delete transaction
 * @param {string} transactionId - Transaction ID to delete
 */
function deleteTransaction(transactionId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    // Get transactions
    const transactions = getUserData('transactions');
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) return;
    
    // Revert transaction effect on account balance
    if (transaction.type === 'income') {
        updateAccountBalance(transaction.accountId, -transaction.amount);
    } else {
        updateAccountBalance(transaction.accountId, transaction.amount);
    }
    
    // Remove transaction
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    
    // Save transactions
    saveUserData('transactions', updatedTransactions);
    
    // Update transactions data
    updateTransactionsData();
}

/**
 * Populate categories dropdown based on transaction type
 */
function populateCategoriesDropdown() {
    const transactionType = document.getElementById('transaction-type');
    const transactionCategory = document.getElementById('transaction-category');
    
    if (!transactionType || !transactionCategory) return;
    
    const type = transactionType.value;
    const categories = getUserData('categories');
    
    // Filter categories by type
    const filteredCategories = categories.filter(category => category.type === type);
    
    // Clear dropdown
    transactionCategory.innerHTML = '';
    
    // Add options
    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        transactionCategory.appendChild(option);
    });
}

/**
 * Populate accounts dropdown
 */
function populateAccountsDropdown() {
    const transactionAccount = document.getElementById('transaction-account');
    
    if (!transactionAccount) return;
    
    const accounts = getUserData('accounts');
    
    // Clear dropdown
    transactionAccount.innerHTML = '';
    
    // Add options
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${formatCurrency(account.balance)})`;
        transactionAccount.appendChild(option);
    });
}
