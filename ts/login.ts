import { User, UsersResponse } from './types.js';

class LoginManager {
    private form: HTMLFormElement;
    private usernameInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;
    private loginButton: HTMLButtonElement;
    private btnText: HTMLElement;
    private btnLoader: HTMLElement;
    private errorMessage: HTMLElement;
    private successMessage: HTMLElement;

    constructor() {
        this.form = document.getElementById('loginForm') as HTMLFormElement;
        this.usernameInput = document.getElementById('username') as HTMLInputElement;
        this.passwordInput = document.getElementById('password') as HTMLInputElement;
        this.loginButton = document.getElementById('loginButton') as HTMLButtonElement;
        this.btnText = this.loginButton.querySelector('.btn-text') as HTMLElement;
        this.btnLoader = this.loginButton.querySelector('.btn-loader') as HTMLElement;
        this.errorMessage = document.getElementById('errorMessage') as HTMLElement;
        this.successMessage = document.getElementById('successMessage') as HTMLElement;

        this.init();
    }

    private init(): void {
        // Check if already logged in
        if (this.isLoggedIn()) {
            window.location.href = 'recipes.html';
            return;
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    private isLoggedIn(): boolean {
        return localStorage.getItem('firstName') !== null;
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        // Validation
        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.hideMessages();
        this.showLoading(true);

        try {
            const user = await this.authenticateUser(username, password);
            
            if (user) {
                // Save user data to localStorage
                localStorage.setItem('firstName', user.firstName);
                localStorage.setItem('userId', user.id.toString());
                
                this.showSuccess(`Welcome back, ${user.firstName}!`);
                
                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = 'recipes.html';
                }, 1000);
            } else {
                this.showError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Connection error. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }

    private async authenticateUser(username: string, password: string): Promise<User | null> {
        try {
            const response = await fetch('https://dummyjson.com/users');
            
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data: UsersResponse = await response.json();
            
            // Find user by username
            const user = data.users.find(u => u.username === username);
            
            // Check if user exists and password is not empty
            if (user && password.length > 0) {
                return user;
            }
            
            return null;
        } catch (error) {
            throw error;
        }
    }

    private showLoading(loading: boolean): void {
        this.loginButton.disabled = loading;
        
        if (loading) {
            this.btnText.style.display = 'none';
            this.btnLoader.style.display = 'flex';
        } else {
            this.btnText.style.display = 'block';
            this.btnLoader.style.display = 'none';
        }
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
    }

    private showSuccess(message: string): void {
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }

    private hideMessages(): void {
        this.errorMessage.style.display = 'none';
        this.successMessage.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});