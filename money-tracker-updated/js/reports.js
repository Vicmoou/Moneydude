/**
 * Money Tracker - Reports JavaScript
 * Handles reports functionality and data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date range
    initializeDateRange();
    
    // Initialize reports data
    updateReportsData();
    
    // Set up chart type toggle
    setupChartTypeToggle();
    
    // Set up date range selector
    setupDateRangeSelector();
    
    // Set up export functionality
    setupExport();
});

/**
 * Initialize date range to current month
 */
function initializeDateRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('start-date').valueAsDate = firstDay;
    document.getElementById('end-date').valueAsDate = lastDay;
}

/**
 * Update reports data and charts
 */
function updateReportsData() {
    // Get date range
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    
    // Update income vs expenses
    updateIncomeExpenses(startDate, endDate);
    
    // Update expense categories chart
    updateExpenseCategoriesChart(startDate, endDate);
    
    // Update monthly comparison chart
    updateMonthlyComparisonChart(startDate, endDate);
}

/**
 * Update income vs expenses summary and chart
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
function updateIncomeExpenses(startDate, endDate) {
    const totalIncomeElement = document.getElementById('total-income');
    const totalExpensesElement = document.getElementById('total-expenses');
    const netSavingsElement = document.getElementById('net-savings');
    
    if (!totalIncomeElement || !totalExpensesElement || !netSavingsElement) return;
    
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Filter transactions by date range and include in reports flag
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && 
               transactionDate <= endDate && 
               t.includeInReports;
    });
    
    // Calculate totals
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);
    
    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);
    
    const netSavings = totalIncome - totalExpenses;
    
    // Update elements
    totalIncomeElement.textContent = formatCurrency(totalIncome);
    totalExpensesElement.textContent = formatCurrency(totalExpenses);
    netSavingsElement.textContent = formatCurrency(netSavings);
    
    // Add color to net savings based on value
    if (netSavings < 0) {
        netSavingsElement.classList.add('currency-negative');
        netSavingsElement.classList.remove('currency-positive');
    } else {
        netSavingsElement.classList.add('currency-positive');
        netSavingsElement.classList.remove('currency-negative');
    }
    
    // Create income vs expenses chart
    createIncomeExpensesChart(startDate, endDate, filteredTransactions);
}

/**
 * Create income vs expenses chart
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Array} transactions - Filtered transactions
 */
function createIncomeExpensesChart(startDate, endDate, transactions) {
    const canvas = document.getElementById('income-expense-chart');
    
    if (!canvas) return;
    
    // Check if chart already exists
    if (window.incomeExpenseChart) {
        window.incomeExpenseChart.destroy();
    }
    
    // Group transactions by date
    const dateGroups = {};
    
    // Create date range array
    const dateRange = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        dateGroups[dateString] = { income: 0, expense: 0 };
        dateRange.push(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group transactions
    transactions.forEach(transaction => {
        const dateString = transaction.date;
        if (dateGroups[dateString]) {
            if (transaction.type === 'income') {
                dateGroups[dateString].income += transaction.amount;
            } else {
                dateGroups[dateString].expense += transaction.amount;
            }
        }
    });
    
    // Prepare chart data
    const incomeData = [];
    const expenseData = [];
    
    dateRange.forEach(date => {
        incomeData.push(dateGroups[date].income);
        expenseData.push(dateGroups[date].expense);
    });
    
    // Format dates for display
    const formattedDates = dateRange.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    // Create chart
    window.incomeExpenseChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: formattedDates,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'rgba(76, 175, 80, 1)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: 'rgba(244, 67, 54, 1)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update expense categories chart
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
function updateExpenseCategoriesChart(startDate, endDate) {
    const canvas = document.getElementById('expense-categories-chart');
    
    if (!canvas) return;
    
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Filter expense transactions by date range and include in reports flag
    const expenseTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate >= startDate && 
               transactionDate <= endDate && 
               t.includeInReports;
    });
    
    // Group by category
    const categoryGroups = {};
    
    expenseTransactions.forEach(transaction => {
        if (!categoryGroups[transaction.categoryId]) {
            categoryGroups[transaction.categoryId] = 0;
        }
        categoryGroups[transaction.categoryId] += transaction.amount;
    });
    
    // Get categories
    const categories = getUserData('categories');
    
    // Prepare chart data
    const categoryNames = [];
    const categoryAmounts = [];
    const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(40, 159, 64, 0.8)',
        'rgba(210, 199, 199, 0.8)'
    ];
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryGroups).sort((a, b) => {
        return categoryGroups[b] - categoryGroups[a];
    });
    
    sortedCategories.forEach((categoryId, index) => {
        const category = categories.find(c => c.id === categoryId);
        categoryNames.push(category ? category.name : 'Unknown');
        categoryAmounts.push(categoryGroups[categoryId]);
    });
    
    // Check if chart already exists
    if (window.expenseCategoriesChart) {
        window.expenseCategoriesChart.destroy();
    }
    
    // Get current chart type
    const chartType = document.getElementById('pie-chart-btn').classList.contains('active') ? 'pie' : 'bar';
    
    // Create chart
    window.expenseCategoriesChart = new Chart(canvas, {
        type: chartType,
        data: {
            labels: categoryNames,
            datasets: [{
                data: categoryAmounts,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: chartType === 'pie' ? 'right' : 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.raw);
                            const total = categoryAmounts.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: chartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            } : undefined
        }
    });
}

/**
 * Update monthly comparison chart
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
function updateMonthlyComparisonChart(startDate, endDate) {
    const canvas = document.getElementById('monthly-comparison-chart');
    
    if (!canvas) return;
    
    // Get transactions
    const transactions = getUserData('transactions');
    
    // Filter transactions by include in reports flag
    const filteredTransactions = transactions.filter(t => t.includeInReports);
    
    // Determine month range
    const monthRange = [];
    const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    
    // Create month range array (up to 12 months)
    const currentMonth = new Date(startMonth);
    let monthCount = 0;
    
    while (currentMonth <= endMonth && monthCount < 12) {
        monthRange.push(new Date(currentMonth));
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        monthCount++;
    }
    
    // Group transactions by month
    const monthGroups = {};
    
    monthRange.forEach(month => {
        const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
        monthGroups[monthKey] = { income: 0, expense: 0 };
    });
    
    filteredTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`;
        
        if (monthGroups[monthKey]) {
            if (transaction.type === 'income') {
                monthGroups[monthKey].income += transaction.amount;
            } else {
                monthGroups[monthKey].expense += transaction.amount;
            }
        }
    });
    
    // Prepare chart data
    const monthLabels = [];
    const incomeData = [];
    const expenseData = [];
    const netData = [];
    
    monthRange.forEach(month => {
        const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
        const monthName = month.toLocaleString('default', { month: 'short' });
        const yearName = month.getFullYear();
        
        monthLabels.push(`${monthName} ${yearName}`);
        incomeData.push(monthGroups[monthKey].income);
        expenseData.push(monthGroups[monthKey].expense);
        netData.push(monthGroups[monthKey].income - monthGroups[monthKey].expense);
    });
    
    // Check if chart already exists
    if (window.monthlyComparisonChart) {
        window.monthlyComparisonChart.destroy();
    }
    
    // Create chart
    window.monthlyComparisonChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(244, 67, 54, 0.8)',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Net',
                    data: netData,
                    type: 'line',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Set up chart type toggle
 */
function setupChartTypeToggle() {
    const pieChartBtn = document.getElementById('pie-chart-btn');
    const barChartBtn = document.getElementById('bar-chart-btn');
    
    if (!pieChartBtn || !barChartBtn) return;
    
    pieChartBtn.addEventListener('click', function() {
        pieChartBtn.classList.add('active');
        barChartBtn.classList.remove('active');
        
        // Get date range
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        // Update expense categories chart
        updateExpenseCategoriesChart(startDate, endDate);
    });
    
    barChartBtn.addEventListener('click', function() {
        barChartBtn.classList.add('active');
        pieChartBtn.classList.remove('active');
        
        // Get date range
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        // Update expense categories chart
        updateExpenseCategoriesChart(startDate, endDate);
    });
}

/**
 * Set up date range selector
 */
function setupDateRangeSelector() {
    const dateRangeSelect = document.getElementById('date-range');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyBtn = document.getElementById('apply-date-range');
    
    if (!dateRangeSelect || !startDateInput || !endDateInput || !applyBtn) return;
    
    // Date range select change
    dateRangeSelect.addEventListener('change', function() {
        const now = new Date();
        let startDate, endDate;
        
        switch (this.value) {
            case 'this-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'this-quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'last-quarter':
                const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
                const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
                const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
                startDate = new Date(year, adjustedQuarter * 3, 1);
                endDate = new Date(year, (adjustedQuarter + 1) * 3, 0);
                break;
            case 'this-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'last-year':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
            case 'custom':
                // Keep current values
                return;
        }
        
        startDateInput.valueAsDate = startDate;
        endDateInput.valueAsDate = endDate;
    });
    
    // Apply button click
    applyBtn.addEventListener('click', function() {
        updateReportsData();
    });
}

/**
 * Set up export functionality
 */
function setupExport() {
    const downloadSummaryBtn = document.getElementById('download-summary');
    
    if (!downloadSummaryBtn) return;
    
    downloadSummaryBtn.addEventListener('click', function() {
        // Get date range
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        
        // Format dates
        const startDateStr = startDate.toLocaleDateString();
        const endDateStr = endDate.toLocaleDateString();
        
        // Get totals
        const totalIncome = document.getElementById('total-income').textContent;
        const totalExpenses = document.getElementById('total-expenses').textContent;
        const netSavings = document.getElementById('net-savings').textContent;
        
        // Create CSV content
        let csvContent = 'Money Tracker - Financial Summary\n';
        csvContent += `Date Range: ${startDateStr} to ${endDateStr}\n\n`;
        csvContent += 'Summary:\n';
        csvContent += `Total Income,${totalIncome}\n`;
        csvContent += `Total Expenses,${totalExpenses}\n`;
        csvContent += `Net Savings,${netSavings}\n\n`;
        
        // Add expense categories
        csvContent += 'Expense Categories:\n';
        csvContent += 'Category,Amount,Percentage\n';
        
        // Get transactions
        const transactions = getUserData('transactions');
        
        // Filter expense transactions by date range and include in reports flag
        const expenseTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && 
                   transactionDate >= startDate && 
                   transactionDate <= endDate && 
                   t.includeInReports;
        });
        
        // Group by category
        const categoryGroups = {};
        
        expenseTransactions.forEach(transaction => {
            if (!categoryGroups[transaction.categoryId]) {
                categoryGroups[transaction.categoryId] = 0;
            }
            categoryGroups[transaction.categoryId] += transaction.amount;
        });
        
        // Get categories
        const categories = getUserData('categories');
        
        // Calculate total expenses
        const totalExpensesAmount = Object.values(categoryGroups).reduce((total, amount) => total + amount, 0);
        
        // Sort categories by amount (descending)
        const sortedCategories = Object.keys(categoryGroups).sort((a, b) => {
            return categoryGroups[b] - categoryGroups[a];
        });
        
        sortedCategories.forEach(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            const amount = categoryGroups[categoryId];
            const percentage = ((amount / totalExpensesAmount) * 100).toFixed(2);
            
            csvContent += `${category ? category.name : 'Unknown'},${formatCurrency(amount)},${percentage}%\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_summary_${startDateStr}_to_${endDateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
