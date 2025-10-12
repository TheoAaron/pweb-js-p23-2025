// Login page TypeScript

// Import types and utilities
interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
}

interface UsersResponse {
    users: User[];
    total: number;
    skip: number;
    limit: number;
}

// Utility functions for this file only
function getElementByIdLocal<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id) as T;
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}

function showLoading(button: HTMLButtonElement, spinner: HTMLElement, text: HTMLElement): void {
    button.disabled = true;
    spinner.classList.remove('hidden');
    text.style.opacity = '0.7';
}

function hideLoading(button: HTMLButtonElement, spinner: HTMLElement, text: HTMLElement): void {
    button.disabled = false;
    spinner.classList.add('hidden');
    text.style.opacity = '1';
}

function showError(element: HTMLElement, message: string): void {
    element.textContent = message;
    element.classList.remove('hidden');
}

function hideError(element: HTMLElement): void {
    element.textContent = '';
    element.classList.add('hidden');
}

function showSuccess(element: HTMLElement, message: string): void {
    element.textContent = message;
    element.classList.remove('hidden');
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// API Service
class ApiService {
    private static readonly BASE_URL = 'https://dummyjson.com';
    private static readonly USERS_ENDPOINT = '/users';

    private static async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
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
            return data as T;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    static async getUsers(): Promise<UsersResponse> {
        const url = `${this.BASE_URL}${this.USERS_ENDPOINT}`;
        return this.fetchWithErrorHandling<UsersResponse>(url);
    }

    static async authenticateUser(username: string, password: string): Promise<User> {
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

// Login class
class LoginManager {
    private form!: HTMLFormElement;
    private usernameInput!: HTMLInputElement;
    private passwordInput!: HTMLInputElement;
    private loginBtn!: HTMLButtonElement;
    private loginBtnText!: HTMLSpanElement;
    private loginSpinner!: HTMLElement;
    private errorMessage!: HTMLElement;
    private successMessage!: HTMLElement;
    private usernameError!: HTMLElement;
    private passwordError!: HTMLElement;

    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.checkExistingAuth();
    }

    private initializeElements(): void {
        try {
            this.form = getElementByIdLocal<HTMLFormElement>('loginForm');
            this.usernameInput = getElementByIdLocal<HTMLInputElement>('username');
            this.passwordInput = getElementByIdLocal<HTMLInputElement>('password');
            this.loginBtn = getElementByIdLocal<HTMLButtonElement>('loginBtn');
            this.loginBtnText = getElementByIdLocal<HTMLSpanElement>('loginBtnText');
            this.loginSpinner = getElementByIdLocal<HTMLElement>('loginSpinner');
            this.errorMessage = getElementByIdLocal<HTMLElement>('errorMessage');
            this.successMessage = getElementByIdLocal<HTMLElement>('successMessage');
            this.usernameError = getElementByIdLocal<HTMLElement>('usernameError');
            this.passwordError = getElementByIdLocal<HTMLElement>('passwordError');
        } catch (error) {
            console.error('Error initializing elements:', error);
        }
    }

    private bindEvents(): void {
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

    private checkExistingAuth(): void {
        const firstName = localStorage.getItem('firstName');
        if (firstName) {
            window.location.href = 'recipes.html';
        }
    }

    private validateForm(): boolean {
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

    private async handleSubmit(event: Event): Promise<void> {
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

        } catch (error) {
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