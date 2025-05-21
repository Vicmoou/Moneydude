/**
 * Money Tracker - Shopping List Swipe JavaScript
 * Handles swipeable shopping list items
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize touch handling for shopping list items
    initSwipeableItems();
});

/**
 * Initialize swipeable items
 */
function initSwipeableItems() {
    // This function will be called when the shopping list is updated
    setupSwipeListeners();
}

/**
 * Set up swipe listeners for shopping list items
 */
function setupSwipeListeners() {
    const shoppingItems = document.querySelectorAll('.shopping-item-container');
    
    shoppingItems.forEach(item => {
        const shoppingItem = item.querySelector('.shopping-item');
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        // Touch events
        item.addEventListener('touchstart', handleTouchStart, { passive: true });
        item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Mouse events (for desktop)
        item.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Touch start handler
        function handleTouchStart(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
            
            // Reset any ongoing animations
            shoppingItem.style.transition = 'none';
        }
        
        // Touch move handler
        function handleTouchMove(e) {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            // Limit swipe range
            const maxSwipeRight = 200;
            const maxSwipeLeft = -200;
            
            let translateX = diffX;
            
            // Apply resistance at the edges
            if (diffX > 0) {
                translateX = Math.min(diffX, maxSwipeRight);
            } else {
                translateX = Math.max(diffX, maxSwipeLeft);
            }
            
            shoppingItem.style.transform = `translateX(${translateX}px)`;
            
            // Prevent scrolling when swiping horizontally
            if (Math.abs(diffX) > 10) {
                e.preventDefault();
            }
        }
        
        // Touch end handler
        function handleTouchEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            shoppingItem.style.transition = 'transform 0.3s ease';
            
            const diffX = currentX - startX;
            
            // Determine action based on swipe distance
            if (diffX > 100) {
                // Swiped right - show left actions
                shoppingItem.style.transform = 'translateX(140px)';
            } else if (diffX < -100) {
                // Swiped left - show right actions
                shoppingItem.style.transform = 'translateX(-140px)';
            } else {
                // Reset position
                shoppingItem.style.transform = 'translateX(0)';
            }
        }
        
        // Mouse down handler
        function handleMouseDown(e) {
            startX = e.clientX;
            isDragging = true;
            
            // Reset any ongoing animations
            shoppingItem.style.transition = 'none';
            
            // Prevent default behavior
            e.preventDefault();
        }
        
        // Mouse move handler
        function handleMouseMove(e) {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const diffX = currentX - startX;
            
            // Limit swipe range
            const maxSwipeRight = 200;
            const maxSwipeLeft = -200;
            
            let translateX = diffX;
            
            // Apply resistance at the edges
            if (diffX > 0) {
                translateX = Math.min(diffX, maxSwipeRight);
            } else {
                translateX = Math.max(diffX, maxSwipeLeft);
            }
            
            shoppingItem.style.transform = `translateX(${translateX}px)`;
        }
        
        // Mouse up handler
        function handleMouseUp() {
            if (!isDragging) return;
            
            isDragging = false;
            shoppingItem.style.transition = 'transform 0.3s ease';
            
            const diffX = currentX - startX;
            
            // Determine action based on swipe distance
            if (diffX > 100) {
                // Swiped right - show left actions
                shoppingItem.style.transform = 'translateX(140px)';
            } else if (diffX < -100) {
                // Swiped left - show right actions
                shoppingItem.style.transform = 'translateX(-140px)';
            } else {
                // Reset position
                shoppingItem.style.transform = 'translateX(0)';
            }
        }
        
        // Reset button click handler
        const resetButtons = item.querySelectorAll('.reset-swipe');
        resetButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                shoppingItem.style.transition = 'transform 0.3s ease';
                shoppingItem.style.transform = 'translateX(0)';
            });
        });
    });
}

// Export the function to be used in shopping-list.js
window.initSwipeableItems = initSwipeableItems;
