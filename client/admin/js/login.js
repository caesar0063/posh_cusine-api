const form = document.getElementById('loginForm');

const savedToken = localStorage.getItem('token');

if (savedToken) {
  try {
    const payload = JSON.parse(atob(savedToken.split('.')[1]));

    if (payload.exp * 1000 > Date.now()) {
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  }
}

let isLoggingIn = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isLoggingIn) {
    return;
  }

  isLoggingIn = true;

  const email = document.getElementById('email').value.trim().toLowerCase();

  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,

        password,
      }),
    });

    const data = await response.json();
    const payload = data.data || data;

    if (!data.success) {
      throw new Error(data.message);
    }

    if (!payload || !payload.token) {
      throw new Error('Login failed. No token received.');
    }

    localStorage.setItem('token', payload.token);
    localStorage.setItem('admin', JSON.stringify(payload.admin));
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Login Error:', error);

    document.getElementById('loginError').textContent =
      error.message || 'Unable to login. Please try again.';
  } finally {
    isLoggingIn = false;
  }
});
