
import type { User, UsersResponse } from './types';

function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = window.setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

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

    if (!username || !password) {
      this.showError('Please fill in all fields');
      (!username ? this.usernameInput : this.passwordInput).focus();
      return;
    }

    this.hideMessages();
    this.showLoading(true);

    try {
      const user = await this.authenticateUser(username, password);
      if (user) {
        localStorage.setItem('firstName', user.firstName);
        localStorage.setItem('userId', String(user.id));

        this.showSuccess(`Welcome back, ${user.firstName}!`);
        setTimeout(() => {
          window.location.replace('recipes.html'); // hindari back ke login
        }, 800);
      } else {
        this.showError('Invalid username or password');
        this.usernameInput.focus();
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Connection error. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }

  // Pakai /users/search?q= + case-insensitive match
  private async authenticateUser(username: string, password: string): Promise<User | null> {
    if (!password.trim()) return null; // sesuai spek: password tidak boleh kosong

    const q = encodeURIComponent(username.trim());
    const resp = await fetchWithTimeout(`https://dummyjson.com/users/search?q=${q}`, {}, 8000);
    if (!resp.ok) throw new Error('Failed to fetch users');

    const data = (await resp.json()) as UsersResponse;
    const uname = username.trim().toLowerCase();

    const user = (data.users || []).find(
      (u) => (u.username || '').toLowerCase() === uname
    );

    return user ?? null;
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

document.addEventListener('DOMContentLoaded', () => {
  new LoginManager();
});
