// Utility functions for the Recipe Collection app

/**
 * Debounce function to limit the rate of function execution
 */
function debounce<T extends (...args: any[]) => any>(
    func: T, 
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}

/**
 * Safely get element by ID with type assertion
 */
function getElementById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id) as T;
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}

/**
 * Show loading spinner and hide text
 */
function showLoading(button: HTMLButtonElement, spinner: HTMLElement, text: HTMLElement): void {
    button.disabled = true;
    spinner.classList.remove('hidden');
    text.style.opacity = '0.7';
}

/**
 * Hide loading spinner and show text
 */
function hideLoading(button: HTMLButtonElement, spinner: HTMLElement, text: HTMLElement): void {
    button.disabled = false;
    spinner.classList.add('hidden');
    text.style.opacity = '1';
}

/**
 * Show error message
 */
function showError(element: HTMLElement, message: string): void {
    element.textContent = message;
    element.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError(element: HTMLElement): void {
    element.textContent = '';
    element.classList.add('hidden');
}

/**
 * Show success message
 */
function showSuccess(element: HTMLElement, message: string): void {
    element.textContent = message;
    element.classList.remove('hidden');
}

/**
 * Hide success message
 */
function hideSuccess(element: HTMLElement): void {
    element.textContent = '';
    element.classList.add('hidden');
}

/**
 * Generate star rating HTML
 */
function generateStarRating(rating: number): string {
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
function formatCookTime(prepTime: number, cookTime: number): string {
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
function capitalize(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): boolean {
    return localStorage.getItem('firstName') !== null;
}

/**
 * Get user's first name from localStorage
 */
function getUserFirstName(): string | null {
    return localStorage.getItem('firstName');
}

/**
 * Save user's first name to localStorage
 */
function saveUserFirstName(firstName: string): void {
    localStorage.setItem('firstName', firstName);
}

/**
 * Clear user data from localStorage
 */
function clearUserData(): void {
    localStorage.removeItem('firstName');
}

/**
 * Redirect to login page if not authenticated
 */
function requireAuth(): void {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

/**
 * Create a delay for better UX
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: any): string {
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
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export {
    debounce,
    getElementById,
    showLoading,
    hideLoading,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    generateStarRating,
    formatCookTime,
    capitalize,
    truncateText,
    isAuthenticated,
    getUserFirstName,
    saveUserFirstName,
    clearUserData,
    requireAuth,
    delay,
    handleApiError,
    isValidEmail,
    sanitizeHtml
};