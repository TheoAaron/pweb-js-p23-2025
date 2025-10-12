// Utility functions for the Recipe Collection app
/**
 * Debounce function to limit the rate of function execution
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}
/**
 * Safely get element by ID with type assertion
 */
function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}
/**
 * Show loading spinner and hide text
 */
function showLoading(button, spinner, text) {
    button.disabled = true;
    spinner.classList.remove('hidden');
    text.style.opacity = '0.7';
}
/**
 * Hide loading spinner and show text
 */
function hideLoading(button, spinner, text) {
    button.disabled = false;
    spinner.classList.add('hidden');
    text.style.opacity = '1';
}
/**
 * Show error message
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}
/**
 * Hide error message
 */
function hideError(element) {
    element.textContent = '';
    element.classList.add('hidden');
}
/**
 * Show success message
 */
function showSuccess(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}
/**
 * Hide success message
 */
function hideSuccess(element) {
    element.textContent = '';
    element.classList.add('hidden');
}
/**
 * Generate star rating HTML
 */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = '';
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
    }
    // Half star
    if (hasHalfStar) {
        stars += '<span class="star">☆</span>';
    }
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star empty">☆</span>';
    }
    return stars;
}
/**
 * Format cooking time
 */
function formatCookTime(prepTime, cookTime) {
    const total = prepTime + cookTime;
    if (total < 60) {
        return `${total} min`;
    }
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
/**
 * Capitalize first letter of each word
 */
function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}
/**
 * Truncate text to specified length
 */
function truncateText(text, length) {
    if (text.length <= length)
        return text;
    return text.substring(0, length).trim() + '...';
}
/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return localStorage.getItem('firstName') !== null;
}
/**
 * Get user's first name from localStorage
 */
function getUserFirstName() {
    return localStorage.getItem('firstName');
}
/**
 * Save user's first name to localStorage
 */
function saveUserFirstName(firstName) {
    localStorage.setItem('firstName', firstName);
}
/**
 * Clear user data from localStorage
 */
function clearUserData() {
    localStorage.removeItem('firstName');
}
/**
 * Redirect to login page if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}
/**
 * Create a delay for better UX
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Handle API errors consistently
 */
function handleApiError(error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return 'Network error. Please check your internet connection.';
    }
    if (error.status) {
        switch (error.status) {
            case 400:
                return 'Invalid request. Please check your input.';
            case 401:
                return 'Invalid username or password.';
            case 404:
                return 'Resource not found.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return error.message || 'An unexpected error occurred.';
        }
    }
    return error.message || 'An unexpected error occurred.';
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
export { debounce, getElementById, showLoading, hideLoading, showError, hideError, showSuccess, hideSuccess, generateStarRating, formatCookTime, capitalize, truncateText, isAuthenticated, getUserFirstName, saveUserFirstName, clearUserData, requireAuth, delay, handleApiError, isValidEmail, sanitizeHtml };
//# sourceMappingURL=utils.js.map