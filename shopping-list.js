/**
 * Money Tracker - Shopping List JavaScript
 * Handles shopping list functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping list data
    updateShoppingListData();
    
    // Set up shopping item modal
    setupShoppingItemModal();
    
    // Set up convert transaction modal
    setupConvertTransactionModal();
    
    // Set up sorting
    setupSorting();
    
    // Add shopping item button
    const addShoppingItemBtn = document.getElementById('add-shopping-item-btn');
    if (addShoppingItemBtn) {
        addShoppingItemBtn.addEventListener('click', function() {
            openAddShoppingItemModal();
        });
    }
});

/**
 * Update shopping list data and display
 */
function updateShoppingListData() {
    // Update shopping list
    updateShoppingList();
}

/**
 * Update shopping list
 */
function updateShoppingList() {
    const container = document.getElementById('shopping-list-container');
    const noItemsMessage = document.getElementById('no-shopping-items-message');
    
    if (!container || !noItemsMessage) return;
    
    const shoppingList = getUserData('shopping_list');
    
    // Apply current sort
    const sortBy = document.getElementById('sort-by').value;
    const sortedList = sortShoppingList(shoppingList, sortBy);
    
    // Clear container
    container.innerHTML = '';
    
    if (sortedList.length === 0) {
        container.style.display = 'none';
        noItemsMessage.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noItemsMessage.style.display = 'none';
    
    // Add items to list
    sortedList.forEach(item => {
        const category = getCategoryById(item.categoryId);
        const account = getAccountById(item.accountId);
        
        // Create container for swipeable item
        const itemContainer = document.createElement('div');
        itemContainer.className = 'shopping-item-container';
        
        // Create the main item element
        const itemElement = document.createElement('div');
        itemElement.className = 'shopping-item';
        
        // Set priority class
        if (item.priority === 'high') {
            itemElement.classList.add('border-left');
            itemElement.style.borderLeftColor = 'var(--danger-color)';
            itemElement.style.borderLeftWidth = '4px';
        } else if (item.priority === 'medium') {
            itemElement.classList.add('border-left');
            itemElement.style.borderLeftColor = 'var(--warning-color)';
            itemElement.style.borderLeftWidth = '4px';
        }
        
        // Create the main item content
        itemElement.innerHTML = `
            <div class="shopping-checkbox">
                <button class="btn btn-sm btn-success convert-item-btn reset-swipe" data-id="${item.id}">
                    <i class="fas fa-check"></i>
                </button>
            </div>
            <div class="shopping-details">
                <div class="shopping-title">${item.name}</div>
                <div class="shopping-meta">
                    <div>${category ? category.name : 'Unknown Category'}</div>
                    <div>${account ? account.name : 'Unknown Account'}</div>
                    ${item.date ? `<div>Due: ${formatDate(item.date)}</div>` : ''}
                </div>
                ${item.notes ? `<div class="text-muted">${item.notes}</div>` : ''}
            </div>
            <div class="shopping-amount">
                ${formatCurrency(item.amount)}
            </div>
        `;
        
        // Create right actions (shown when swiping left)
        const rightActions = document.createElement('div');
        rightActions.className = 'shopping-item-actions';
        rightActions.innerHTML = `
            <div class="action-button action-edit" data-id="${item.id}">
                <i class="fas fa-edit"></i> Edit
            </div>
            <div class="action-button action-delete" data-id="${item.id}">
                <i class="fas fa-trash"></i> Delete
            </div>
        `;
        
        // Create left actions (shown when swiping right)
        const leftActions = document.createElement('div');
        leftActions.className = 'shopping-item-actions-left';
        leftActions.innerHTML = `
            <div class="action-button action-details" data-id="${item.id}">
                <i class="fas fa-info-circle"></i> Details
            </div>
            <div class="action-button action-convert" data-id="${item.id}">
                <i class="fas fa-check"></i> Convert
            </div>
        `;
        
        // Add swipe indicator
        const swipeIndicator = document.createElement('div');
        swipeIndicator.className = 'swipe-indicator';
        swipeIndicator.innerHTML = `
            <i class="fas fa-chevron-left"></i>
            Swipe
            <i class="fas fa-chevron-right"></i>
        `;
        
        // Assemble the swipeable item
        itemContainer.appendChild(leftActions);
        itemContainer.appendChild(itemElement);
        itemContainer.appendChild(rightActions);
        itemContainer.appendChild(swipeIndicator);
        
        // Add to container
        container.appendChild(itemContainer);
    });
    
    // Add event listeners to action buttons
    
    // Convert buttons
    const convertButtons = container.querySelectorAll('.convert-item-btn, .action-convert');
    convertButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-id');
            openConvertTransactionModal(itemId);
        });
    });
    
    // Edit buttons
    const editButtons = container.querySelectorAll('.action-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-id');
            openEditShoppingItemModal(itemId);
        });
    });
    
    // Delete buttons
    const deleteButtons = container.querySelectorAll('.action-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-id');
            deleteShoppingItem(itemId);
        });
    });
    
    // Details buttons
    const detailsButtons = container.querySelectorAll('.action-details');
    detailsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const itemId = this.getAttribute('data-id');
            const item = sortedList.find(i => i.id === itemId);
            if (item) {
                const category = getCategoryById(item.categoryId);
                const account = getAccountById(item.accountId);
                
                let detailsMessage = `
                    Item: ${item.name}\n
                    Amount: ${formatCurrency(item.amount)}\n
                    Category: ${category ? category.name : 'Unknown'}\n
                    Account: ${account ? account.name : 'Unknown'}\n
                `;
                
                if (item.date) {
                    detailsMessage += `Due Date: ${formatDate(item.date)}\n`;
                }
                
                if (item.notes) {
                    detailsMessage += `Notes: ${item.notes}\n`;
                }
                
                detailsMessage += `Priority: ${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}\n`;
                detailsMessage += `Created: ${formatDate(item.createdAt)}`;
                
                alert(detailsMessage);
            }
        });
    });
    
    // Initialize swipe functionality
    if (window.initSwipeableItems) {
        window.initSwipeableItems();
    }
}

/**
 * Sort shopping list
 * @param {Array} shoppingList - Shopping list array
 * @param {string} sortBy - Sort method
 * @returns {Array} - Sorted shopping list
 */
function sortShoppingList(shoppingList, sortBy) {
    const sortedList = [...shoppingList];
    
    sortedList.sort((a, b) => {
        switch (sortBy) {
            case 'date-asc':
                return new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31');
            case 'date-desc':
                return new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01');
            case 'amount-asc':
                return a.amount - b.amount;
            case 'amount-desc':
                return b.amount - a.amount;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            default:
                return new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31');
        }
    });
    
    return sortedList;
}

/**
 * Set up sorting
 */
function setupSorting() {
    const sortBy = document.getElementById('sort-by');
    
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            updateShoppingList();
        });
    }
}

/**
 * Set up shopping item modal
 */
function setupShoppingItemModal() {
    const shoppingItemModal = document.getElementById('shopping-item-modal');
    const closeShoppingItemModal = document.getElementById('close-shopping-item-modal');
    const cancelShoppingItem = document.getElementById('cancel-shopping-item');
    const saveShoppingItem = document.getElementById('save-shopping-item');
    const shoppingItemForm = document.getElementById('shopping-item-form');
    
    if (!shoppingItemModal || !closeShoppingItemModal || !cancelShoppingItem || 
        !saveShoppingItem || !shoppingItemForm) return;
    
    // Hide modal when close button is clicked
    closeShoppingItemModal.addEventListener('click', function() {
        hideModal('shopping-item-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelShoppingItem.addEventListener('click', function() {
        hideModal('shopping-item-modal');
    });
    
    // Save shopping item
    saveShoppingItem.addEventListener('click', function() {
        // Validate form
        if (!shoppingItemForm.checkValidity()) {
            shoppingItemForm.reportValidity();
            return;
        }
        
        // Get form values
        const itemId = document.getElementById('shopping-item-id').value;
        const name = document.getElementById('shopping-item-name').value;
        const amount = parseFloat(document.getElementById('shopping-item-amount').value);
        const categoryId = document.getElementById('shopping-item-category').value;
        const accountId = document.getElementById('shopping-item-account').value;
        const date = document.getElementById('shopping-item-date').value || null;
        const notes = document.getElementById('shopping-item-notes').value;
        const priority = document.getElementById('shopping-item-priority').value;
        
        // Get shopping list
        const shoppingList = getUserData('shopping_list');
        
        if (itemId) {
            // Edit existing item
            const itemIndex = shoppingList.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
                // Update item
                shoppingList[itemIndex] = {
                    ...shoppingList[itemIndex],
                    name: name,
                    amount: amount,
                    categoryId: categoryId,
                    accountId: accountId,
                    date: date,
                    notes: notes,
                    priority: priority
                };
            }
        } else {
            // Create new item
            const newItem = {
                id: generateId(),
                name: name,
                amount: amount,
                categoryId: categoryId,
                accountId: accountId,
                date: date,
                notes: notes,
                priority: priority,
                createdAt: new Date().toISOString()
            };
            
            // Add item
            shoppingList.push(newItem);
        }
        
        // Save shopping list
        saveUserData('shopping_list', shoppingList);
        
        // Update shopping list data
        updateShoppingListData();
        
        // Hide modal
        hideModal('shopping-item-modal');
    });
}

/**
 * Open add shopping item modal
 */
function openAddShoppingItemModal() {
    // Reset form
    document.getElementById('shopping-item-form').reset();
    document.getElementById('shopping-item-id').value = '';
    document.getElementById('shopping-item-modal-title').textContent = 'Add Planned Transaction';
    
    // Populate categories dropdown (expense only)
    populateCategoriesDropdown();
    
    // Populate accounts dropdown
    populateAccountsDropdown();
    
    // Show modal
    showModal('shopping-item-modal');
}

/**
 * Open edit shopping item modal
 * @param {string} itemId - Item ID to edit
 */
function openEditShoppingItemModal(itemId) {
    const shoppingList = getUserData('shopping_list');
    const item = shoppingList.find(item => item.id === itemId);
    
    if (!item) return;
    
    // Set form values
    document.getElementById('shopping-item-id').value = item.id;
    document.getElementById('shopping-item-name').value = item.name;
    document.getElementById('shopping-item-amount').value = item.amount;
    document.getElementById('shopping-item-date').value = item.date || '';
    document.getElementById('shopping-item-notes').value = item.notes || '';
    document.getElementById('shopping-item-priority').value = item.priority || 'medium';
    document.getElementById('shopping-item-modal-title').textContent = 'Edit Planned Transaction';
    
    // Populate categories dropdown (expense only)
    populateCategoriesDropdown();
    
    // Populate accounts dropdown
    populateAccountsDropdown();
    
    // Set selected category and account
    document.getElementById('shopping-item-category').value = item.categoryId;
    document.getElementById('shopping-item-account').value = item.accountId;
    
    // Show modal
    showModal('shopping-item-modal');
}

/**
 * Delete shopping item
 * @param {string} itemId - Item ID to delete
 */
function deleteShoppingItem(itemId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this planned transaction?')) {
        return;
    }
    
    // Get shopping list
    const shoppingList = getUserData('shopping_list');
    
    // Remove item
    const updatedList = shoppingList.filter(item => item.id !== itemId);
    
    // Save shopping list
    saveUserData('shopping_list', updatedList);
    
    // Update shopping list data
    updateShoppingListData();
}

/**
 * Populate categories dropdown (expense only)
 */
function populateCategoriesDropdown() {
    const categorySelect = document.getElementById('shopping-item-category');
    
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

/**
 * Populate accounts dropdown
 */
function populateAccountsDropdown() {
    const accountSelect = document.getElementById('shopping-item-account');
    
    if (!accountSelect) return;
    
    const accounts = getUserData('accounts');
    
    // Clear dropdown
    accountSelect.innerHTML = '';
    
    // Add options
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        accountSelect.appendChild(option);
    });
}

/**
 * Set up convert transaction modal
 */
function setupConvertTransactionModal() {
    const convertModal = document.getElementById('convert-transaction-modal');
    const closeConvertModal = document.getElementById('close-convert-modal');
    const cancelConvert = document.getElementById('cancel-convert');
    const confirmConvert = document.getElementById('confirm-convert');
    const convertForm = document.getElementById('convert-transaction-form');
    
    if (!convertModal || !closeConvertModal || !cancelConvert || 
        !confirmConvert || !convertForm) return;
    
    // Hide modal when close button is clicked
    closeConvertModal.addEventListener('click', function() {
        hideModal('convert-transaction-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelConvert.addEventListener('click', function() {
        hideModal('convert-transaction-modal');
    });
    
    // Confirm convert
    confirmConvert.addEventListener('click', function() {
        // Validate form
        if (!convertForm.checkValidity()) {
            convertForm.reportValidity();
            return;
        }
        
        // Get form values
        const itemId = document.getElementById('convert-item-id').value;
        const amount = parseFloat(document.getElementById('convert-amount').value);
        const date = document.getElementById('convert-date').value;
        const description = document.getElementById('convert-description').value;
        
        // Convert to transaction
        convertToTransaction(itemId, amount, date, description);
        
        // Hide modal
        hideModal('convert-transaction-modal');
    });
}

/**
 * Open convert transaction modal
 * @param {string} itemId - Item ID to convert
 */
function openConvertTransactionModal(itemId) {
    const shoppingList = getUserData('shopping_list');
    const item = shoppingList.find(item => item.id === itemId);
    
    if (!item) return;
    
    // Set form values
    document.getElementById('convert-item-id').value = item.id;
    document.getElementById('convert-amount').value = item.amount;
    document.getElementById('convert-date').valueAsDate = new Date();
    document.getElementById('convert-description').value = item.name;
    
    // Show modal
    showModal('convert-transaction-modal');
}

/**
 * Convert shopping item to transaction
 * @param {string} itemId - Item ID to convert
 * @param {number} amount - Final transaction amount
 * @param {string} date - Transaction date
 * @param {string} description - Transaction description
 */
function convertToTransaction(itemId, amount, date, description) {
    // Get shopping list
    const shoppingList = getUserData('shopping_list');
    const item = shoppingList.find(item => item.id === itemId);
    
    if (!item) return;
    
    // Create transaction
    const transaction = {
        id: generateId(),
        type: 'expense',
        amount: amount,
        categoryId: item.categoryId,
        accountId: item.accountId,
        date: date,
        description: description,
        includeInReports: true,
        createdAt: new Date().toISOString(),
        convertedFromShoppingItem: true,
        shoppingItemId: item.id
    };
    
    // Add transaction
    const transactions = getUserData('transactions');
    transactions.push(transaction);
    saveUserData('transactions', transactions);
    
    // Update account balance
    updateAccountBalance(item.accountId, -amount);
    
    // Remove item from shopping list
    const updatedList = shoppingList.filter(i => i.id !== itemId);
    saveUserData('shopping_list', updatedList);
    
    // Update shopping list data
    updateShoppingListData();
}
