/**
 * Money Tracker - Categories JavaScript
 * Handles categories functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize categories data
    updateCategoriesData();
    
    // Set up category modal
    setupCategoryModal();
    
    // Set up category tabs
    setupCategoryTabs();
    
    // Add category button
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            openAddCategoryModal();
        });
    }
});

/**
 * Update categories data and display
 */
function updateCategoriesData() {
    // Update income categories
    updateIncomeCategoriesGrid();
    
    // Update expense categories
    updateExpenseCategoriesGrid();
}

/**
 * Set up category tabs
 */
function setupCategoryTabs() {
    const incomeTab = document.getElementById('income-tab');
    const expenseTab = document.getElementById('expense-tab');
    const incomeCategories = document.getElementById('income-categories');
    const expenseCategories = document.getElementById('expense-categories');
    
    if (!incomeTab || !expenseTab || !incomeCategories || !expenseCategories) return;
    
    incomeTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Activate income tab
        incomeTab.classList.add('active');
        expenseTab.classList.remove('active');
        
        // Show income categories
        incomeCategories.style.display = 'block';
        expenseCategories.style.display = 'none';
    });
    
    expenseTab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Activate expense tab
        expenseTab.classList.add('active');
        incomeTab.classList.remove('active');
        
        // Show expense categories
        expenseCategories.style.display = 'block';
        incomeCategories.style.display = 'none';
    });
}

/**
 * Update income categories grid
 */
function updateIncomeCategoriesGrid() {
    const container = document.getElementById('income-categories-container');
    
    if (!container) return;
    
    const categories = getUserData('categories');
    
    // Filter income categories
    const incomeCategories = categories.filter(category => category.type === 'income');
    
    // Clear container
    container.innerHTML = '';
    
    if (incomeCategories.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center">No income categories added yet</p></div>';
        return;
    }
    
    // Add categories
    incomeCategories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        
        categoryCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body text-center">
                    <div class="category-icon mb-3" style="margin: 0 auto; width: 60px; height: 60px;">
                        ${category.icon && category.icon.startsWith('data:') 
                            ? `<img src="${category.icon}" alt="${category.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<i class="fas fa-tag" style="font-size: 24px;"></i>`}
                    </div>
                    <h4 class="category-name">${category.name}</h4>
                    <p class="text-muted">Income Category</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline edit-category-btn" data-id="${category.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-category-btn" data-id="${category.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(categoryCard);
    });
    
    // Add event listeners to edit buttons
    const editButtons = container.querySelectorAll('.edit-category-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            openEditCategoryModal(categoryId);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = container.querySelectorAll('.delete-category-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            deleteCategory(categoryId);
        });
    });
}

/**
 * Update expense categories grid
 */
function updateExpenseCategoriesGrid() {
    const container = document.getElementById('expense-categories-container');
    
    if (!container) return;
    
    const categories = getUserData('categories');
    
    // Filter expense categories
    const expenseCategories = categories.filter(category => category.type === 'expense');
    
    // Clear container
    container.innerHTML = '';
    
    if (expenseCategories.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center">No expense categories added yet</p></div>';
        return;
    }
    
    // Add categories
    expenseCategories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        
        categoryCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body text-center">
                    <div class="category-icon mb-3" style="margin: 0 auto; width: 60px; height: 60px;">
                        ${category.icon && category.icon.startsWith('data:') 
                            ? `<img src="${category.icon}" alt="${category.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<i class="fas fa-tag" style="font-size: 24px;"></i>`}
                    </div>
                    <h4 class="category-name">${category.name}</h4>
                    <p class="text-muted">Expense Category</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline edit-category-btn" data-id="${category.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-category-btn" data-id="${category.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(categoryCard);
    });
    
    // Add event listeners to edit buttons
    const editButtons = container.querySelectorAll('.edit-category-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            openEditCategoryModal(categoryId);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = container.querySelectorAll('.delete-category-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            deleteCategory(categoryId);
        });
    });
}

/**
 * Set up category modal
 */
function setupCategoryModal() {
    const categoryModal = document.getElementById('category-modal');
    const closeCategoryModal = document.getElementById('close-category-modal');
    const cancelCategory = document.getElementById('cancel-category');
    const saveCategory = document.getElementById('save-category');
    const categoryForm = document.getElementById('category-form');
    const categoryIcon = document.getElementById('category-icon');
    const categoryIconPreview = document.getElementById('category-icon-preview');
    const categoryIconImg = document.getElementById('category-icon-img');
    
    if (!categoryModal || !closeCategoryModal || !cancelCategory || 
        !saveCategory || !categoryForm || !categoryIcon || 
        !categoryIconPreview || !categoryIconImg) return;
    
    // Hide modal when close button is clicked
    closeCategoryModal.addEventListener('click', function() {
        hideModal('category-modal');
    });
    
    // Hide modal when cancel button is clicked
    cancelCategory.addEventListener('click', function() {
        hideModal('category-modal');
    });
    
    // Handle icon upload
    categoryIcon.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                categoryIconImg.src = e.target.result;
                categoryIconPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            categoryIconPreview.style.display = 'none';
        }
    });
    
    // Save category
    saveCategory.addEventListener('click', async function() {
        // Validate form
        if (!categoryForm.checkValidity()) {
            categoryForm.reportValidity();
            return;
        }
        
        // Get form values
        const categoryId = document.getElementById('category-id').value;
        const name = document.getElementById('category-name').value;
        const type = document.getElementById('category-type').value;
        
        // Handle icon
        let iconBase64 = null;
        if (categoryIcon.files.length > 0) {
            try {
                iconBase64 = await imageToBase64(categoryIcon.files[0]);
            } catch (error) {
                console.error('Error converting image to base64:', error);
            }
        } else if (categoryIconPreview.style.display !== 'none') {
            // Keep existing icon
            iconBase64 = categoryIconImg.src;
        }
        
        // Get categories
        const categories = getUserData('categories');
        
        if (categoryId) {
            // Edit existing category
            const categoryIndex = categories.findIndex(c => c.id === categoryId);
            
            if (categoryIndex !== -1) {
                // Update category
                categories[categoryIndex].name = name;
                categories[categoryIndex].type = type;
                if (iconBase64) {
                    categories[categoryIndex].icon = iconBase64;
                }
            }
        } else {
            // Create new category
            const newCategory = {
                id: generateId(),
                name: name,
                type: type,
                icon: iconBase64,
                createdAt: new Date().toISOString()
            };
            
            // Add category
            categories.push(newCategory);
        }
        
        // Save categories
        saveUserData('categories', categories);
        
        // Update categories data
        updateCategoriesData();
        
        // Hide modal
        hideModal('category-modal');
    });
}

/**
 * Open add category modal
 */
function openAddCategoryModal() {
    // Reset form
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-modal-title').textContent = 'Add Category';
    document.getElementById('category-icon-preview').style.display = 'none';
    
    // Show modal
    showModal('category-modal');
}

/**
 * Open edit category modal
 * @param {string} categoryId - Category ID to edit
 */
function openEditCategoryModal(categoryId) {
    const categories = getUserData('categories');
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) return;
    
    // Set form values
    document.getElementById('category-id').value = category.id;
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-type').value = category.type;
    document.getElementById('category-modal-title').textContent = 'Edit Category';
    
    // Set icon preview if exists
    if (category.icon) {
        document.getElementById('category-icon-img').src = category.icon;
        document.getElementById('category-icon-preview').style.display = 'block';
    } else {
        document.getElementById('category-icon-preview').style.display = 'none';
    }
    
    // Show modal
    showModal('category-modal');
}

/**
 * Delete category
 * @param {string} categoryId - Category ID to delete
 */
function deleteCategory(categoryId) {
    // Check if category is used in transactions
    const transactions = getUserData('transactions');
    const hasTransactions = transactions.some(t => t.categoryId === categoryId);
    
    if (hasTransactions) {
        alert('Cannot delete category that is used in transactions. Please reassign transactions first.');
        return;
    }
    
    // Check if category is used in budgets
    const budgets = getUserData('budgets');
    const hasBudgets = budgets.some(b => b.categoryId === categoryId);
    
    if (hasBudgets) {
        alert('Cannot delete category that is used in budgets. Please delete or reassign budgets first.');
        return;
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    // Get categories
    const categories = getUserData('categories');
    
    // Remove category
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    
    // Save categories
    saveUserData('categories', updatedCategories);
    
    // Update categories data
    updateCategoriesData();
}
