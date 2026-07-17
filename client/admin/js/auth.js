const API_URL = 'http://localhost:5000/api/v1/auth/login';

const form = document.getElementById('loginForm');
const button = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

// Only run login logic if login form exists

if (form) {
  // If already logged in, go dashboard
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.textContent = '';

    button.disabled = true;

    button.textContent = 'Logging in...';

    const email = document.getElementById('email').value.trim();

    const password = document.getElementById('password').value;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();
      const payload = result.data || result;

      if (!response.ok) {
        throw new Error(result.message || 'Login failed.');
      }

      if (!payload || !payload.token) {
        throw new Error('Login failed. No token returned.');
      }

      localStorage.setItem('token', payload.token);
      localStorage.setItem('admin', JSON.stringify(payload.admin));

      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error(error);

      errorMessage.textContent = error.message;
    } finally {
      button.disabled = false;

      button.textContent = 'Login';
    }
  });
}
