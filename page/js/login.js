"use strict";
// Login page TypeScript
// Utility functions for this file only
function getElementByIdLocal(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}
function showLoading(button, spinner, text) {
    button.disabled = true;
    spinner.classList.remove('hidden');
    text.style.opacity = '0.7';
}
function hideLoading(button, spinner, text) {
    button.disabled = false;
    spinner.classList.add('hidden');
    text.style.opacity = '1';
}
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}
function hideError(element) {
    element.textContent = '';
    element.classList.add('hidden');
}
function showSuccess(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// API Service
class ApiService {
    static async fetchWithErrorHandling(url, options) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }
    static async getUsers() {
        const url = `${this.BASE_URL}${this.USERS_ENDPOINT}`;
        return this.fetchWithErrorHandling(url);
    }
    static async authenticateUser(username, password) {
        if (!password.trim()) {
            throw new Error('Password cannot be empty');
        }
        const usersResponse = await this.getUsers();
        const user = usersResponse.users.find(u => u.username === username);
        if (!user) {
            throw new Error('Invalid username or password');
        }
        return user;
    }
}
ApiService.BASE_URL = 'https://dummyjson.com';
ApiService.USERS_ENDPOINT = '/users';
// Login class
class LoginManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.checkExistingAuth();
    }
    initializeElements() {
        try {
            this.form = getElementByIdLocal('loginForm');
            this.usernameInput = getElementByIdLocal('username');
            this.passwordInput = getElementByIdLocal('password');
            this.loginBtn = getElementByIdLocal('loginBtn');
            this.loginBtnText = getElementByIdLocal('loginBtnText');
            this.loginSpinner = getElementByIdLocal('loginSpinner');
            this.errorMessage = getElementByIdLocal('errorMessage');
            this.successMessage = getElementByIdLocal('successMessage');
            this.usernameError = getElementByIdLocal('usernameError');
            this.passwordError = getElementByIdLocal('passwordError');
        }
        catch (error) {
            console.error('Error initializing elements:', error);
        }
    }
    bindEvents() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        // Clear field-specific errors when user types
        this.usernameInput.addEventListener('input', () => {
            hideError(this.usernameError);
            hideError(this.errorMessage);
        });
        this.passwordInput.addEventListener('input', () => {
            hideError(this.passwordError);
            hideError(this.errorMessage);
        });
    }
    checkExistingAuth() {
        const firstName = localStorage.getItem('firstName');
        if (firstName) {
            window.location.href = 'recipes.html';
        }
    }
    validateForm() {
        let isValid = true;
        // Clear previous errors
        hideError(this.usernameError);
        hideError(this.passwordError);
        hideError(this.errorMessage);
        // Validate username
        if (!this.usernameInput.value.trim()) {
            showError(this.usernameError, 'Username is required');
            isValid = false;
        }
        // Validate password
        if (!this.passwordInput.value.trim()) {
            showError(this.passwordError, 'Password is required');
            isValid = false;
        }
        return isValid;
    }
    async handleSubmit(event) {
        event.preventDefault();
        if (!this.validateForm()) {
            return;
        }
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();
        try {
            // Show loading state
            showLoading(this.loginBtn, this.loginSpinner, this.loginBtnText);
            hideError(this.errorMessage);
            // Simulate minimum loading time for better UX
            const [user] = await Promise.all([
                ApiService.authenticateUser(username, password),
                delay(1000)
            ]);
            // Show success message
            showSuccess(this.successMessage, `Welcome, ${user.firstName}! Redirecting...`);
            // Save user data to localStorage
            localStorage.setItem('firstName', user.firstName);
            // Redirect after a short delay
            await delay(1500);
            window.location.href = 'recipes.html';
        }
        catch (error) {
            hideLoading(this.loginBtn, this.loginSpinner, this.loginBtnText);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            showError(this.errorMessage, errorMessage);
        }
    }
}
// Initialize the login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});
//# sourceMappingURL=login.js.map