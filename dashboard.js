/**
 * Money Tracker - Dashboard JavaScript
 * Handles dashboard functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard data
    updateDashboardData();
    
    // Set up transaction modal
    setupTransactionModal();
    
    // Set up debt/loan modal
    setupDebtLoanModal();
});

/**
 * Update all dashboard data
 */
function updateDashboardData() {
    // Update balance overview
    updateBalanceOverview();
    
    // Update debts and loans
    updateDebtsLoans();
    
    // Update recent transactions
    updateRecentTransactions();
    
    // Update budget overview
    updateBudgetOverview();
}

/**
 * Update balance overview section
 */
function updateBalanceOverview() {
    const totalBalanceElement = document.getElementById('total-balance');
    const totalIncomeElement = document.getElementById('total-income');
    const totalExpensesElement = document.getElementById('total-expenses');
    
    if (!totalBalanceElement || !totalIncomeElement || !totalExpensesElement) return;
    
    // Calculate total balance
    const totalBalance = calculateTotalBalance();
    totalBalanceElement.textContent = formatCurrency(totalBalance);
    
    // Calculate income and expenses for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const totalIncome = calculateTotalIncome(startOfMonth, endOfMonth);
    const totalExpenses = calculateTotalExpenses(startOfMonth, endOfMonth);
    
    totalIncomeElement.textContent = formatCurrency(totalIncome);
    totalExpensesElement.textContent = formatCurrency(totalExpenses);
}

/**
 * Update debts and loans section
 */
function updateDebtsLoans() {
    const debtsListElement = document.getElementById('debts-list');
    const loansListElement = document.getElementById('loans-list');
    
    if (!debtsListElement || !loansListElement) return;
    
    const debtsLoans = getUserData('debts_loans');
    
    // Filter debts (money I owe)
    const debts = debtsLoans.filter(item => item.type === 'debt');
    
    // Filter loans (money owed to me)
    const loans = debtsLoans.filter(item => item.type === 'loan');
    
    // Update debts list
    if (debts.length === 0) {
        debtsListElement.innerHTML = '<p class="text-muted text-center">No debts recorded</p>';
    } else {
        let debtsHtml = '';
        debts.forEach(debt => {
            debtsHtml += `
                <div class="transaction-item" data-id="${debt.id}">
                    <div class="transaction-icon">
                        ${debt.photo ? `<img src="${debt.photo}" alt="${debt.person}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : '<i class="fas fa-hand-holding-usd"></i>'}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${debt.person}</div>
                        <div class="transaction-meta">
                            <div class="transaction-date">${formatDate(debt.date)}</div>
                            ${debt.dueDate ? `<div class="ml-2">Due: ${formatDate(debt.dueDate)}</div>` : ''}
                        </div>
                        ${debt.description ? `<div class="text-muted">${debt.description}</div>` : ''}
                    </div>
                    <div class="transaction-amount currency-negative">${formatCurrency(debt.amount)}</div>
                </div>
            `;
        });
        debtsListElement.innerHTML = debtsHtml;
    }
    
    // Update loans list
    if (loans.length === 0) {
        loansListElement.innerHTML = '<p class="text-muted text-center">No loans recorded</p>';
    } else {
        let loansHtml = '';
        loans.forEach(loan => {
            loansHtml += `
                <div class="transaction-item" data-id="${loan.id}">
                    <div class="transaction-icon">
                        ${loan.photo ? `<img src="${loan.photo}" alt="${loan.person}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : '<i class="fas fa-hand-holding-usd"></i>'}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${loan.person}</div>
                        <div class="transaction-meta">
                            <div class="transaction-date">${formatDate(loan.date)}</div>
                            ${loan.dueDate ? `<div class="ml-2">Due: ${formatDate(loan.dueDate)}</div>` : ''}
                        </div>
                        ${loan.description ? `<div class="text-muted">${loan.description}</div>` : ''}
                    </div>
                    <div class="transaction-amount currency-positive">${formatCurrency(loan.amount)}</div>
                </div>
            `;
        });
        loansListElement.innerHTML = loansHtml;
    }
}

/**
 * Update recent transactions section
 */
function updateRecentTransactions() {
    const recentTransactionsElement = document.getElementById('recent-transactions');
    
    if (!recentTransactionsElement) return;
    
    const transactions = getUserData('transactions');
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Get only the 5 most recent transactions
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    // Update recent transactions list
    if (recentTransactions.length === 0) {
        recentTransactionsElement.innerHTML = '<p class="text-muted text-center">No transactions recorded</p>';
    } else {
        let transactionsHtml = '';
        recentTransactions.forEach(transaction => {
            const category = getCategoryById(transaction.categoryId);
            const account = getAccountById(transaction.accountId);
            
            transactionsHtml += `
                <div class="transaction-item" data-id="${transaction.id}">
                    <div class="transaction-icon">
                        <i class="fas ${transaction.type === 'income' ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.description || (category ? category.name : 'Unknown')}</div>
                        <div class="transaction-meta">
                            <div class="transaction-account">${account ? account.name : 'Unknown'}</div>
                            <div class="transaction-date">${formatDate(transaction.date)}</div>
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type === 'income' ? 'currency-positive' : 'currency-negative'}">
                        ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        });
        recentTransactionsElement.innerHTML = transactionsHtml;
    }
}

/**
 * Update budget overview section
 */
function updateBudgetOverview() {
    const budgetOverviewElement = document.getElementById('budget-overview');
    
    if (!budgetOverviewElement) return;
    
    const budgets = getUserData('budgets');
    
    // Filter active budgets (current date is within budget date range)
    const now = new Date();
    const activeBudgets = budgets.filter(budget => {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        return now >= startDate && now <= endDate;
    });
    
    // Update budget overview
    if (activeBudgets.length === 0) {
        budgetOverviewElement.innerHTML = '<p class="text-muted text-center">No active budgets</p>';
    } else {
        let budgetsHtml = '';
        activeBudgets.forEach(budget => {
            const category = getCategoryById(budget.categoryId);
            
            // Calculate spent amount for this budget
            const transactions = getUserData('transactions');
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            
            const spentAmount = transactions
                .filter(t => t.categoryId === budget.categoryId && 
                           t.type === 'expense' &&
                           new Date(t.date) >= startDate && 
                           new Date(t.date) <= endDate)
                .reduce((total, t) => total + t.amount, 0);
            
            // Calculate percentage
            const percentage = (spentAmount / budget.amount) * 100;
            const isOverBudget = spentAmount > budget.amount;
            
            budgetsHtml += `
                <div class="budget-progress">
                    <div class="budget-header">
                        <div class="budget-category">${category ? category.name : 'Unknown'}</div>
                        <div class="budget-values">
                            <div class="budget-spent">${formatCurrency(spentAmount)}</div>
                            <div class="budget-limit">/ ${formatCurrency(budget.amount)}</div>
                        </div>
                    </div>
                    <div class="progress">
                        <div class="progress-bar ${isOverBudget ? 'progress-bar-danger' : 'progress-bar-success'}" 
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
            `;
        });
        budgetOverviewElement.innerHTML = budgetsHtml;
    }
}

/**
 * Set up transaction modal
 */
function setupTransactionModal() {
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const closeTransactionModal = document.getElementById('close-transaction-modal');
    const cancelTransaction = document.getElementById('cancel-transaction');
    const saveTransaction = document.getElementById('save-transaction');
    const transactionForm = document.getElementById('transaction-form');
    const transactionType = document.getElementById('transaction-type');
    const transactionCategory = document.getElementById('transaction-category');
    const transactionAccount = document.getElementById('transaction-account');
    const transactionDate = document.getElementById('transaction-date');
    
    if (!addTransactionBtn || !transactionModal || !closeTransactionModal || 
        !cancelTransaction || !saveTransaction || !transactionForm || 
        !transactionType || !transactionCategory || !transactionAccount || !transactionDate) return;
    
    // Set default date to today
    transactionDate.valueAsDate = new Date();
    
    // Show modal when add transaction button is clicked
    addTransactionBtn.addEventListener('click', function() {
        // Populate categories dropdown
        populateCategoriesDropdown();
        
        // Populate accounts dropdown
        populateAccountsDropdown();
        
        // Show modal
        showModal('transaction-modal');
    });
    
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
        const type = transactionType.value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const categoryId = transactionCategory.value;
        const accountId = transactionAccount.value;
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;
        const includeInReports = document.getElementById('transaction-include-in-reports').checked;
        
        // Create transaction object
        const transaction = {
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
        
        // Add transaction to storage
        const transactions = getUserData('transactions');
        transactions.push(transaction);
        saveUserData('transactions', transactions);
        
        // Update account balance
        updateAccountBalance(accountId, type === 'income' ? amount : -amount);
        
        // Update dashboard
        updateDashboardData();
        
        // Hide modal
        hideModal('transaction-modal');
        
        // Reset form
        transactionForm.reset();
        transactionDate.valueAsDate = new Date();
    });
    
    /**
     * Populate categories dropdown based on transaction type
     */
    function populateCategoriesDropdown() {
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
        const accounts = getUserData('accounts');
        
        // Clear dropdown
        transactionAccount.innerHTML = '';
        
        // Add options
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            transactionAccount.appendChild(option);
        });
    }
}

/**
 * Set up debt/loan modal
 */
function setupDebtLoanModal() {
    const addDebtBtn = document.getElementById('add-debt-btn');
    const addLoanBtn = document.getElementById('add-loan-btn');
    const debtLoanModal = document.getElementById('debt-loan-modal');
    const debtLoanModalTitle = document.getElementById('debt-loan-modal-title');
    const closeDebtLoanModal = document.getElementById('close-debt-loan-modal');
    const cancelDebtLoan = document.getElementById('cancel-debt-loan');
    const saveDebtLoan = document.getElementById('save-debt-loan');
    const debtLoanForm = document.getElementById('debt-loan-form');
    const debtLoanPhoto = document.getElementById('debt-loan-photo');
    const debtLoanPhotoPreview = document.getElementById('debt-loan-photo-preview');
    const debtLoanPhotoImg = document.getElementById('debt-loan-photo-img');
    const debtLoanDate = document.getElementById('debt-loan-date');
    
    if (!addDebtBtn || !addLoanBtn || !debtLoanModal || !debtLoanModalTitle || 
        !closeDebtLoanModal || !cancelDebtLoan || !saveDebtLoan || !debtLoanForm || 
        !debtLoanPhoto || !debtLoanPhotoPreview || !debtLoanPhotoImg || !debtLoanDate) return;
    
    // Set default date to today
    debtLoanDate.valueAsDate = new Date();
    
    // Track current type (debt or loan)
    let currentType = 'debt';
    
    // Show modal when add debt button is clicked
    addDebtBtn.addEventListener('click', function() {
        currentType = 'debt';
        debtLoanModalTitle.textContent = 'Add Debt';
        showModal('debt-loan-modal');
    });
    
    // Show modal when add loan button is clicked
    addLoanBtn.addEventListener('click', function() {
        currentType = 'loan';
        debtLoanModalTitle.textContent = 'Add Loan';
        showModal('debt-loan-modal');
    });
    
    // Hide modal when close button is clicked
    closeDebtLoanModal.addEventListener('click', function() {
        hideModal('debt-loan-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelDebtLoan.addEventListener('click', function() {
        hideModal('debt-loan-modal');
    });
    
    // Handle photo upload
    debtLoanPhoto.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                debtLoanPhotoImg.src = e.target.result;
                debtLoanPhotoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            debtLoanPhotoPreview.style.display = 'none';
        }
    });
    
    // Save debt/loan
    saveDebtLoan.addEventListener('click', async function() {
        // Validate form
        if (!debtLoanForm.checkValidity()) {
            debtLoanForm.reportValidity();
            return;
        }
        
        // Get form values
        const amount = parseFloat(document.getElementById('debt-loan-amount').value);
        const person = document.getElementById('debt-loan-person').value;
        const date = document.getElementById('debt-loan-date').value;
        const dueDate = document.getElementById('debt-loan-due-date').value || null;
        const description = document.getElementById('debt-loan-description').value;
        
        // Handle photo
        let photoBase64 = null;
        if (debtLoanPhoto.files.length > 0) {
            try {
                photoBase64 = await imageToBase64(debtLoanPhoto.files[0]);
            } catch (error) {
                console.error('Error converting image to base64:', error);
            }
        }
        
        // Create debt/loan object
        const debtLoan = {
            id: generateId(),
            type: currentType,
            amount: amount,
            person: person,
            date: date,
            dueDate: dueDate,
            description: description,
            photo: photoBase64,
            createdAt: new Date().toISOString()
        };
        
        // Add debt/loan to storage
        const debtsLoans = getUserData('debts_loans');
        debtsLoans.push(debtLoan);
        saveUserData('debts_loans', debtsLoans);
        
        // Update dashboard
        updateDebtsLoans();
        
        // Hide modal
        hideModal('debt-loan-modal');
        
        // Reset form
        debtLoanForm.reset();
        debtLoanDate.valueAsDate = new Date();
        debtLoanPhotoPreview.style.display = 'none';
    });
}
