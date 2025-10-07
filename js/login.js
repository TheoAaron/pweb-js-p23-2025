class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('loginButton');
        this.btnText = this.loginButton.querySelector('.btn-text');
        this.btnLoader = this.loginButton.querySelector('.btn-loader');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');

        this.init();
    }

    init() {
        if (this.isLoggedIn()) {
            window.location.href = 'recipes.html';
            return;
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    isLoggedIn() {
        return localStorage.getItem('firstName') !== null;
    }

    async handleSubmit(e) {
        e.preventDefault();

        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.hideMessages();
        this.showLoading(true);

        try {
            const resp = await fetch('https://dummyjson.com/users');
            if (!resp.ok) throw new Error('Network response was not ok');
            const data = await resp.json();
            const user = data.users.find(u => u.username === username);

            if (user && password.length > 0) {
                localStorage.setItem('firstName', user.firstName);
                localStorage.setItem('userId', String(user.id));
                this.showSuccess(`Welcome back, ${user.firstName}!`);
                setTimeout(() => { window.location.href = 'recipes.html'; }, 900);
            } else {
                this.showError('Invalid username or password');
            }
        } catch (err) {
            console.error(err);
            this.showError('Connection error. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(loading) {
        this.loginButton.disabled = loading;
        if (loading) { this.btnText.style.display = 'none'; this.btnLoader.style.display = 'flex'; }
        else { this.btnText.style.display = 'block'; this.btnLoader.style.display = 'none'; }
    }

    showError(msg) { this.errorMessage.textContent = msg; this.errorMessage.style.display = 'block'; this.successMessage.style.display = 'none'; }
    showSuccess(msg) { this.successMessage.textContent = msg; this.successMessage.style.display = 'block'; this.errorMessage.style.display = 'none'; }
    hideMessages() { this.errorMessage.style.display = 'none'; this.successMessage.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => new LoginManager());
