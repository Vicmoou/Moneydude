/**
 * Money Tracker - AI Chat JavaScript
 * Handles AI assistant functionality and chat interface
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set up chat form
    setupChatForm();
    
    // Set up suggested questions
    setupSuggestedQuestions();
});

/**
 * Set up chat form
 */
function setupChatForm() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatForm || !chatInput || !chatMessages) return;
    
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            addUserMessage(message);
            
            // Clear input
            chatInput.value = '';
            
            // Process message and get AI response
            const response = processUserMessage(message);
            
            // Add AI response with slight delay for natural feel
            setTimeout(() => {
                addAIMessage(response);
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 500);
        }
    });
}

/**
 * Set up suggested questions
 */
function setupSuggestedQuestions() {
    const suggestedQuestions = document.querySelectorAll('.suggested-question');
    
    suggestedQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const message = this.textContent;
            
            // Add user message
            addUserMessage(message);
            
            // Process message and get AI response
            const response = processUserMessage(message);
            
            // Add AI response with slight delay for natural feel
            setTimeout(() => {
                addAIMessage(response);
                
                // Scroll to bottom
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }, 500);
        });
    });
}

/**
 * Add user message to chat
 * @param {string} message - User message
 */
function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Add AI message to chat
 * @param {string} message - AI message
 */
function addAIMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message ai-message';
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
}

/**
 * Process user message and generate AI response
 * @param {string} message - User message
 * @returns {string} - AI response
 */
function processUserMessage(message) {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Check for balance related questions
    if (lowerMessage.includes('balance') || lowerMessage.includes('how much money') || 
        lowerMessage.includes('current balance') || lowerMessage.includes('total balance')) {
        return getBalanceResponse();
    }
    
    // Check for spending related questions
    if (lowerMessage.includes('spend') || lowerMessage.includes('spent') || 
        lowerMessage.includes('expenses') || lowerMessage.includes('expense')) {
        return getSpendingResponse();
    }
    
    // Check for income related questions
    if (lowerMessage.includes('income') || lowerMessage.includes('earn') || 
        lowerMessage.includes('earning') || lowerMessage.includes('received')) {
        return getIncomeResponse();
    }
    
    // Check for category related questions
    if (lowerMessage.includes('categor') || lowerMessage.includes('top expense') || 
        lowerMessage.includes('most spent on') || lowerMessage.includes('spending breakdown')) {
        return getCategoryResponse();
    }
    
    // Check for budget related questions
    if (lowerMessage.includes('budget') || lowerMessage.includes('over budget') || 
        lowerMessage.includes('create budget') || lowerMessage.includes('set budget')) {
        return getBudgetResponse();
    }
    
    // Check for account related questions
    if (lowerMessage.includes('account') || lowerMessage.includes('add account') || 
        lowerMessage.includes('create account')) {
        return getAccountResponse();
    }
    
    // Check for transaction related questions
    if (lowerMessage.includes('transaction') || lowerMessage.includes('add transaction') || 
        lowerMessage.includes('record transaction') || lowerMessage.includes('new transaction')) {
        return getTransactionResponse();
    }
    
    // Check for data export/import related questions
    if (lowerMessage.includes('export') || lowerMessage.includes('import') || 
        lowerMessage.includes('backup') || lowerMessage.includes('save data')) {
        return getDataExportImportResponse();
    }
    
    // Check for help related questions
    if (lowerMessage.includes('help') || lowerMessage.includes('how to') || 
        lowerMessage.includes('guide') || lowerMessage.includes('tutorial')) {
        return getHelpResponse();
    }
    
    // Default response for unrecognized questions
    return getDefaultResponse();
}

/**
 * Get balance response
 * @returns {string} - Balance response
 */
function getBalanceResponse() {
    // Get accounts
    const accounts = getUserData('accounts');
    
    // Calculate total balance
    const totalBalance = accounts.reduce((total, account) => total + account.balance, 0);
    
    // Format response
    let response = `Your current total balance across all accounts is <strong>${formatCurrency(totalBalance)}</strong>.<br><br>`;
    
    response += 'Here\'s the breakdown by account:<br><ul>';
    
    accounts.forEach(account => {
        response += `<li><strong>${account.name}</strong>: ${formatCurrency(account.balance)}</li>`;
    });
    
    response += '</ul>';
    
    return response;
}

/**
 * Get spending response
 * @returns {string} - Spending response
 */
function getSpendingResponse() {
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Get current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter expense transactions for current month
    const currentMonthExpenses = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    // Calculate total expenses for current month
    const totalExpenses = currentMonthExpenses.reduce((total, t) => total + t.amount, 0);
    
    // Get previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter expense transactions for previous month
    const previousMonthExpenses = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === previousMonth && 
               transactionDate.getFullYear() === previousYear;
    });
    
    // Calculate total expenses for previous month
    const previousTotalExpenses = previousMonthExpenses.reduce((total, t) => total + t.amount, 0);
    
    // Calculate percentage change
    let percentageChange = 0;
    let changeText = '';
    
    if (previousTotalExpenses > 0) {
        percentageChange = ((totalExpenses - previousTotalExpenses) / previousTotalExpenses) * 100;
        
        if (percentageChange > 0) {
            changeText = `This is <span class="text-danger">${percentageChange.toFixed(1)}% more</span> than last month.`;
        } else if (percentageChange < 0) {
            changeText = `This is <span class="text-success">${Math.abs(percentageChange).toFixed(1)}% less</span> than last month.`;
        } else {
            changeText = 'This is the same as last month.';
        }
    }
    
    // Format response
    const monthName = now.toLocaleString('default', { month: 'long' });
    
    let response = `You've spent <strong>${formatCurrency(totalExpenses)}</strong> in ${monthName}.<br>`;
    
    if (changeText) {
        response += `${changeText}<br><br>`;
    }
    
    // Add top 3 expense categories
    if (currentMonthExpenses.length > 0) {
        // Group by category
        const categoryGroups = {};
        
        currentMonthExpenses.forEach(transaction => {
            if (!categoryGroups[transaction.categoryId]) {
                categoryGroups[transaction.categoryId] = 0;
            }
            categoryGroups[transaction.categoryId] += transaction.amount;
        });
        
        // Sort categories by amount
        const sortedCategories = Object.keys(categoryGroups).sort((a, b) => {
            return categoryGroups[b] - categoryGroups[a];
        });
        
        // Get top 3 categories
        const topCategories = sortedCategories.slice(0, 3);
        
        if (topCategories.length > 0) {
            response += 'Your top spending categories this month are:<br><ul>';
            
            // Get categories
            const categories = getUserData('categories');
            
            topCategories.forEach(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                const amount = categoryGroups[categoryId];
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                
                response += `<li><strong>${category ? category.name : 'Unknown'}</strong>: ${formatCurrency(amount)} (${percentage}%)</li>`;
            });
            
            response += '</ul>';
        }
    }
    
    return response;
}

/**
 * Get income response
 * @returns {string} - Income response
 */
function getIncomeResponse() {
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Get current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter income transactions for current month
    const currentMonthIncome = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    // Calculate total income for current month
    const totalIncome = currentMonthIncome.reduce((total, t) => total + t.amount, 0);
    
    // Get previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter income transactions for previous month
    const previousMonthIncome = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               transactionDate.getMonth() === previousMonth && 
               transactionDate.getFullYear() === previousYear;
    });
    
    // Calculate total income for previous month
    const previousTotalIncome = previousMonthIncome.reduce((total, t) => total + t.amount, 0);
    
    // Calculate percentage change
    let percentageChange = 0;
    let changeText = '';
    
    if (previousTotalIncome > 0) {
        percentageChange = ((totalIncome - previousTotalIncome) / previousTotalIncome) * 100;
        
        if (percentageChange > 0) {
            changeText = `This is <span class="text-success">${percentageChange.toFixed(1)}% more</span> than last month.`;
        } else if (percentageChange < 0) {
            changeText = `This is <span class="text-danger">${Math.abs(percentageChange).toFixed(1)}% less</span> than last month.`;
        } else {
            changeText = 'This is the same as last month.';
        }
    }
    
    // Format response
    const monthName = now.toLocaleString('default', { month: 'long' });
    
    let response = `You've earned <strong>${formatCurrency(totalIncome)}</strong> in ${monthName}.<br>`;
    
    if (changeText) {
        response += `${changeText}<br><br>`;
    }
    
    // Add income sources
    if (currentMonthIncome.length > 0) {
        // Group by category
        const categoryGroups = {};
        
        currentMonthIncome.forEach(transaction => {
            if (!categoryGroups[transaction.categoryId]) {
                categoryGroups[transaction.categoryId] = 0;
            }
            categoryGroups[transaction.categoryId] += transaction.amount;
        });
        
        // Sort categories by amount
        const sortedCategories = Object.keys(categoryGroups).sort((a, b) => {
            return categoryGroups[b] - categoryGroups[a];
        });
        
        if (sortedCategories.length > 0) {
            response += 'Your income sources this month are:<br><ul>';
            
            // Get categories
            const categories = getUserData('categories');
            
            sortedCategories.forEach(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                const amount = categoryGroups[categoryId];
                const percentage = ((amount / totalIncome) * 100).toFixed(1);
                
                response += `<li><strong>${category ? category.name : 'Unknown'}</strong>: ${formatCurrency(amount)} (${percentage}%)</li>`;
            });
            
            response += '</ul>';
        }
    }
    
    return response;
}

/**
 * Get category response
 * @returns {string} - Category response
 */
function getCategoryResponse() {
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Get current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter expense transactions for current month
    const currentMonthExpenses = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    // Calculate total expenses for current month
    const totalExpenses = currentMonthExpenses.reduce((total, t) => total + t.amount, 0);
    
    // Format response
    const monthName = now.toLocaleString('default', { month: 'long' });
    
    let response = `Here's your spending breakdown by category for ${monthName}:<br><br>`;
    
    // Group by category
    const categoryGroups = {};
    
    currentMonthExpenses.forEach(transaction => {
        if (!categoryGroups[transaction.categoryId]) {
            categoryGroups[transaction.categoryId] = 0;
        }
        categoryGroups[transaction.categoryId] += transaction.amount;
    });
    
    // Sort categories by amount
    const sortedCategories = Object.keys(categoryGroups).sort((a, b) => {
        return categoryGroups[b] - categoryGroups[a];
    });
    
    if (sortedCategories.length > 0) {
        response += '<ul>';
        
        // Get categories
        const categories = getUserData('categories');
        
        sortedCategories.forEach(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            const amount = categoryGroups[categoryId];
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            
            response += `<li><strong>${category ? category.name : 'Unknown'}</strong>: ${formatCurrency(amount)} (${percentage}%)</li>`;
        });
        
        response += '</ul>';
        
        response += `<br>To see more detailed reports, visit the <a href="reports.html">Reports</a> page.`;
    } else {
        response = `You don't have any expenses recorded for ${monthName} yet.`;
    }
    
    return response;
}

/**
 * Get budget response
 * @returns {string} - Budget response
 */
function getBudgetResponse() {
    // Get budgets
    const budgets = getUserData('budgets');
    
    // Get current date
    const now = new Date();
    
    // Filter active budgets
    const activeBudgets = budgets.filter(budget => {
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        
        return now >= budgetStart && now <= budgetEnd;
    });
    
    if (activeBudgets.length === 0) {
        return `You don't have any active budgets. To create a budget, go to the <a href="budget.html">Budget</a> page and click "Add Budget".`;
    }
    
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Get categories
    const categories = getUserData('categories');
    
    let response = 'Here are your active budgets:<br><br><ul>';
    
    activeBudgets.forEach(budget => {
        const category = categories.find(c => c.id === budget.categoryId);
        if (!category) return;
        
        // Calculate spent amount for this budget
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
        
        response += `<li><strong>${category.name}</strong>: ${formatCurrency(spentAmount)} of ${formatCurrency(budget.amount)} (${percentage.toFixed(1)}%)`;
        
        if (isOverBudget) {
            response += ` - <span class="text-danger">Over budget by ${formatCurrency(-remaining)}</span>`;
        } else {
            response += ` - <span class="text-success">${formatCurrency(remaining)} remaining</span>`;
        }
        
        response += `</li>`;
    });
    
    response += '</ul><br>';
    
    response += `To manage your budgets, visit the <a href="budget.html">Budget</a> page.`;
    
    return response;
}

/**
 * Get account response
 * @returns {string} - Account response
 */
function getAccountResponse() {
    // Get accounts
    const accounts = getUserData('accounts');
    
    let response = 'To add a new account, go to the <a href="accounts.html">Accounts</a> page and click "Add Account".<br><br>';
    
    response += 'Here are your current accounts:<br><br><ul>';
    
    accounts.forEach(account => {
        response += `<li><strong>${account.name}</strong>: ${formatCurrency(account.balance)}</li>`;
    });
    
    response += '</ul>';
    
    return response;
}

/**
 * Get transaction response
 * @returns {string} - Transaction response
 */
function getTransactionResponse() {
    let response = 'To add a new transaction, go to the <a href="transactions.html">Transactions</a> page and click "Add Transaction".<br><br>';
    
    response += 'When adding a transaction, you\'ll need to provide the following information:<br><ul>';
    response += '<li>Transaction type (income or expense)</li>';
    response += '<li>Amount</li>';
    response += '<li>Category</li>';
    response += '<li>Account</li>';
    response += '<li>Date</li>';
    response += '<li>Description (optional)</li>';
    response += '<li>Whether to include in reports</li>';
    response += '</ul><br>';
    
    response += 'You can also edit or delete existing transactions from the Transactions page.';
    
    return response;
}

/**
 * Get data export/import response
 * @returns {string} - Data export/import response
 */
function getDataExportImportResponse() {
    let response = 'To export or import your data, go to the <a href="profile.html">Profile</a> page and scroll down to the "Data Management" section.<br><br>';
    
    response += 'From there, you can:<br><ul>';
    response += '<li>Export all your data as a JSON file for backup</li>';
    response += '<li>Import data from a previously exported JSON file</li>';
    response += '<li>Reset all your data (use with caution!)</li>';
    response += '</ul><br>';
    
    response += 'It\'s a good idea to export your data regularly as a backup.';
    
    return response;
}

/**
 * Get help response
 * @returns {string} - Help response
 */
function getHelpResponse() {
    let response = 'Here are some things I can help you with:<br><br><ul>';
    response += '<li>Check your account balances</li>';
    response += '<li>See how much you\'ve spent this month</li>';
    response += '<li>View your top expense categories</li>';
    response += '<li>Check your budget status</li>';
    response += '<li>Learn how to add transactions, accounts, or budgets</li>';
    response += '<li>Find out how to export or import your data</li>';
    response += '</ul><br>';
    
    response += 'You can ask me questions like "What\'s my current balance?" or "How much did I spend this month?"';
    
    return response;
}

/**
 * Get default response
 * @returns {string} - Default response
 */
function getDefaultResponse() {
    const responses = [
        "I'm not sure I understand. Could you try rephrasing your question?",
        "I don't have information about that yet. Is there something else I can help you with?",
        "I'm still learning! Could you ask me something about your accounts, transactions, or budgets?",
        "I don't have an answer for that. Try asking about your finances, like 'What's my balance?' or 'How much did I spend?'",
        "I'm not able to answer that question. You can ask me about your accounts, spending, budgets, or how to use the Money Tracker app."
    ];
    
    // Return random response
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
