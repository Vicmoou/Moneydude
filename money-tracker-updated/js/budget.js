/**
 * Money Tracker - Budget JavaScript
 * Handles budget functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set default month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('budget-month').value = currentMonth;
    
    // Initialize budget data
    updateBudgetData();
    
    // Set up budget modal
    setupBudgetModal();
    
    // Add budget button
    const addBudgetBtn = document.getElementById('add-budget-btn');
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener('click', function() {
            openAddBudgetModal();
        });
    }
    
    // Month change event
    const budgetMonth = document.getElementById('budget-month');
    if (budgetMonth) {
        budgetMonth.addEventListener('change', function() {
            updateBudgetData();
        });
    }
});

/**
 * Update budget data and display
 */
function updateBudgetData() {
    // Update budget progress
    updateBudgetProgress();
    
    // Update budgets table
    updateBudgetsTable();
}

/**
 * Update budget progress for current period
 */
function updateBudgetProgress() {
    const container = document.getElementById('budget-progress-container');
    const noMessage = document.getElementById('no-budgets-message');
    const totalBudgetElement = document.getElementById('total-budget');
    const totalSpentElement = document.getElementById('total-spent');
    const totalRemainingElement = document.getElementById('total-remaining');
    
    if (!container || !noMessage || !totalBudgetElement || !totalSpentElement || !totalRemainingElement) return;
    
    // Get selected month
    const selectedMonth = document.getElementById('budget-month').value;
    const [year, month] = selectedMonth.split('-').map(Number);
    
    // Create date range for selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    // Get budgets
    const budgets = getUserData('budgets');
    
    // Filter budgets for current period
    const currentBudgets = budgets.filter(budget => {
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        
        // Check if budget overlaps with selected month
        return (budgetStart <= endDate && budgetEnd >= startDate);
    });
    
    // Clear container
    container.innerHTML = '';
    
    if (currentBudgets.length === 0) {
        container.style.display = 'none';
        noMessage.style.display = 'block';
        
        // Reset totals
        totalBudgetElement.textContent = formatCurrency(0);
        totalSpentElement.textContent = formatCurrency(0);
        totalRemainingElement.textContent = formatCurrency(0);
        
        return;
    }
    
    container.style.display = 'block';
    noMessage.style.display = 'none';
    
    // Calculate totals
    let totalBudget = 0;
    let totalSpent = 0;
    
    // Add budget progress bars
    currentBudgets.forEach(budget => {
        const category = getCategoryById(budget.categoryId);
        if (!category) return;
        
        // Calculate spent amount for this budget
        const transactions = getUserData('transactions');
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        
        const spentAmount = transactions
            .filter(t => t.categoryId === budget.categoryId && 
                       t.type === 'expense' &&
                       new Date(t.date) >= budgetStart && 
                       new Date(t.date) <= budgetEnd)
            .reduce((total, t) => total + t.amount, 0);
        
        // Calculate percentage
        const percentage = (spentAmount / budget.amount) * 100;
        const isOverBudget = spentAmount > budget.amount;
        const remaining = budget.amount - spentAmount;
        
        // Add to totals
        totalBudget += budget.amount;
        totalSpent += spentAmount;
        
        // Create progress bar
        const progressElement = document.createElement('div');
        progressElement.className = 'budget-progress mb-4';
        
        progressElement.innerHTML = `
            <div class="budget-header">
                <div class="budget-category">${category.name}</div>
                <div class="budget-values">
                    <div class="budget-spent">${formatCurrency(spentAmount)}</div>
                    <div class="budget-limit">/ ${formatCurrency(budget.amount)}</div>
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar ${isOverBudget ? 'progress-bar-danger' : 'progress-bar-success'}" 
                     style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div class="d-flex justify-content-between mt-1">
                <div class="text-muted">${percentage.toFixed(1)}%</div>
                <div class="${isOverBudget ? 'text-danger' : 'text-success'}">
                    ${isOverBudget ? 'Over by ' + formatCurrency(-remaining) : formatCurrency(remaining) + ' left'}
                </div>
            </div>
        `;
        
        container.appendChild(progressElement);
    });
    
    // Update totals
    const totalRemaining = totalBudget - totalSpent;
    totalBudgetElement.textContent = formatCurrency(totalBudget);
    totalSpentElement.textContent = formatCurrency(totalSpent);
    totalRemainingElement.textContent = formatCurrency(totalRemaining);
    
    // Add color to remaining based on value
    if (totalRemaining < 0) {
        totalRemainingElement.classList.add('currency-negative');
        totalRemainingElement.classList.remove('currency-positive');
    } else {
        totalRemainingElement.classList.add('currency-positive');
        totalRemainingElement.classList.remove('currency-negative');
    }
}

/**
 * Update budgets table
 */
function updateBudgetsTable() {
    const tableBody = document.getElementById('budgets-table-body');
    const noMessage = document.getElementById('no-budgets-table-message');
    
    if (!tableBody || !noMessage) return;
    
    // Get budgets
    const budgets = getUserData('budgets');
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (budgets.length === 0) {
        tableBody.style.display = 'none';
        noMessage.style.display = 'block';
        return;
    }
    
    tableBody.style.display = '';
    noMessage.style.display = 'none';
    
    // Sort budgets by end date (newest first)
    const sortedBudgets = [...budgets].sort((a, b) => {
        return new Date(b.endDate) - new Date(a.endDate);
    });
    
    // Add budgets to table
    sortedBudgets.forEach(budget => {
        const category = getCategoryById(budget.categoryId);
        if (!category) return;
        
        // Calculate spent amount for this budget
        const transactions = getUserData('transactions');
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        
        const spentAmount = transactions
            .filter(t => t.categoryId === budget.categoryId && 
                       t.type === 'expense' &&
                       new Date(t.date) >= budgetStart && 
                       new Date(t.date) <= budgetEnd)
            .reduce((total, t) => total + t.amount, 0);
        
        // Calculate percentage
        const percentage = (spentAmount / budget.amount) * 100;
        const isOverBudget = spentAmount > budget.amount;
        
        // Check if budget is active
        const now = new Date();
        const isActive = now >= budgetStart && now <= budgetEnd;
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${formatCurrency(budget.amount)}</td>
            <td>${formatDate(budget.startDate)}</td>
            <td>${formatDate(budget.endDate)}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar ${isOverBudget ? 'progress-bar-danger' : 'progress-bar-success'}" 
                         style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="d-flex justify-content-between">
                    <small>${formatCurrency(spentAmount)} / ${formatCurrency(budget.amount)}</small>
                    <small>${percentage.toFixed(1)}%</small>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline edit-budget-btn" data-id="${budget.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-budget-btn" data-id="${budget.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Highlight active budgets
        if (isActive) {
            row.classList.add('table-active');
        }
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    const editButtons = tableBody.querySelectorAll('.edit-budget-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const budgetId = this.getAttribute('data-id');
            openEditBudgetModal(budgetId);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = tableBody.querySelectorAll('.delete-budget-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const budgetId = this.getAttribute('data-id');
            deleteBudget(budgetId);
        });
    });
}

/**
 * Set up budget modal
 */
function setupBudgetModal() {
    const budgetModal = document.getElementById('budget-modal');
    const closeBudgetModal = document.getElementById('close-budget-modal');
    const cancelBudget = document.getElementById('cancel-budget');
    const saveBudget = document.getElementById('save-budget');
    const budgetForm = document.getElementById('budget-form');
    
    if (!budgetModal || !closeBudgetModal || !cancelBudget || 
        !saveBudget || !budgetForm) return;
    
    // Hide modal when close button is clicked
    closeBudgetModal.addEventListener('click', function() {
        hideModal('budget-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelBudget.addEventListener('click', function() {
        hideModal('budget-modal');
    });
    
    // Save budget
    saveBudget.addEventListener('click', function() {
        // Validate form
        if (!budgetForm.checkValidity()) {
            budgetForm.reportValidity();
            return;
        }
        
        // Get form values
        const budgetId = document.getElementById('budget-id').value;
        const categoryId = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        const startDate = document.getElementById('budget-start-date').value;
        const endDate = document.getElementById('budget-end-date').value;
        const notes = document.getElementById('budget-notes').value;
        
        // Validate dates
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        
        // Get budgets
        const budgets = getUserData('budgets');
        
        if (budgetId) {
            // Edit existing budget
            const budgetIndex = budgets.findIndex(b => b.id === budgetId);
            
            if (budgetIndex !== -1) {
                // Update budget
                budgets[budgetIndex] = {
                    ...budgets[budgetIndex],
                    categoryId: categoryId,
                    amount: amount,
                    startDate: startDate,
                    endDate: endDate,
                    notes: notes
                };
            }
        } else {
            // Check for duplicate budget for same category and overlapping date range
            const isDuplicate = budgets.some(budget => {
                if (budget.categoryId !== categoryId) return false;
                
                const existingStart = new Date(budget.startDate);
                const existingEnd = new Date(budget.endDate);
                const newStart = new Date(startDate);
                const newEnd = new Date(endDate);
                
                // Check if date ranges overlap
                return (newStart <= existingEnd && newEnd >= existingStart);
            });
            
            if (isDuplicate) {
                alert('A budget for this category already exists in the selected date range');
                return;
            }
            
            // Create new budget
            const newBudget = {
                id: generateId(),
                categoryId: categoryId,
                amount: amount,
                startDate: startDate,
                endDate: endDate,
                notes: notes,
                createdAt: new Date().toISOString()
            };
            
            // Add budget
            budgets.push(newBudget);
        }
        
        // Save budgets
        saveUserData('budgets', budgets);
        
        // Update budget data
        updateBudgetData();
        
        // Hide modal
        hideModal('budget-modal');
    });
}

/**
 * Open add budget modal
 */
function openAddBudgetModal() {
    // Reset form
    document.getElementById('budget-form').reset();
    document.getElementById('budget-id').value = '';
    document.getElementById('budget-modal-title').textContent = 'Add Budget';
    
    // Set default dates to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('budget-start-date').valueAsDate = firstDay;
    document.getElementById('budget-end-date').valueAsDate = lastDay;
    
    // Populate categories dropdown (expense only)
    populateCategoriesDropdown();
    
    // Show modal
    showModal('budget-modal');
}

/**
 * Open edit budget modal
 * @param {string} budgetId - Budget ID to edit
 */
function openEditBudgetModal(budgetId) {
    const budgets = getUserData('budgets');
    const budget = budgets.find(b => b.id === budgetId);
    
    if (!budget) return;
    
    // Set form values
    document.getElementById('budget-id').value = budget.id;
    document.getElementById('budget-amount').value = budget.amount;
    document.getElementById('budget-start-date').value = budget.startDate;
    document.getElementById('budget-end-date').value = budget.endDate;
    document.getElementById('budget-notes').value = budget.notes || '';
    document.getElementById('budget-modal-title').textContent = 'Edit Budget';
    
    // Populate categories dropdown (expense only)
    populateCategoriesDropdown();
    
    // Set selected category
    document.getElementById('budget-category').value = budget.categoryId;
    
    // Show modal
    showModal('budget-modal');
}

/**
 * Delete budget
 * @param {string} budgetId - Budget ID to delete
 */
function deleteBudget(budgetId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this budget?')) {
        return;
    }
    
    // Get budgets
    const budgets = getUserData('budgets');
    
    // Remove budget
    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    
    // Save budgets
    saveUserData('budgets', updatedBudgets);
    
    // Update budget data
    updateBudgetData();
}

/**
 * Populate categories dropdown (expense only)
 */
function populateCategoriesDropdown() {
    const categorySelect = document.getElementById('budget-category');
    
    if (!categorySelect) return;
    
    const categories = getUserData('categories');
    
    // Filter expense categories
    const expenseCategories = categories.filter(category => category.type === 'expense');
    
    // Clear dropdown
    categorySelect.innerHTML = '';
    
    // Add options
    expenseCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}
