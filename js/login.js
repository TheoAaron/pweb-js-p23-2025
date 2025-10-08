
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

  
  fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    return fetch(url, { ...opts, signal: ctrl.signal })
      .finally(() => clearTimeout(id));
  }

  async handleSubmit(e) {
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
          window.location.replace('recipes.html');
        }, 800);
      } else {
        this.showError('Invalid username or password');
        this.usernameInput.focus();
      }
    } catch (err) {
      console.error(err);
      this.showError('Connection error. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }

  
  async authenticateUser(username, password) {
    if (!password.trim()) return null; 

    const q = encodeURIComponent(username.trim());
    const resp = await this.fetchWithTimeout(`https://dummyjson.com/users/search?q=${q}`, {}, 8000);
    if (!resp.ok) throw new Error('Network response was not ok');

    const data = await resp.json();
    const uname = username.trim().toLowerCase();

    const user = (data.users || []).find(
      (u) => (u.username || '').toLowerCase() === uname
    );

    return user || null;
  }

  showLoading(loading) {
    this.loginButton.disabled = loading;
    if (loading) {
      this.btnText.style.display = 'none';
      this.btnLoader.style.display = 'flex';
    } else {
      this.btnText.style.display = 'block';
      this.btnLoader.style.display = 'none';
    }
  }

  showError(msg) {
    this.errorMessage.textContent = msg;
    this.errorMessage.style.display = 'block';
    this.successMessage.style.display = 'none';
  }

  showSuccess(msg) {
    this.successMessage.textContent = msg;
    this.successMessage.style.display = 'block';
    this.errorMessage.style.display = 'none';
  }

  hideMessages() {
    this.errorMessage.style.display = 'none';
    this.successMessage.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginManager());
