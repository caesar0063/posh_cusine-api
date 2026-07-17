const token = localStorage.getItem('token');

if (!token) {
  window.location.replace('login.html');
}

try {
  const payload = JSON.parse(atob(token.split('.')[1]));

  if (payload.exp * 1000 < Date.now()) {
    localStorage.clear();

    window.location.replace('login.html');
  }
} catch (error) {
  localStorage.clear();

  window.location.replace('login.html');
}

// Check JWT expiry

try {
  const payload = JSON.parse(atob(token.split('.')[1]));

  const expiry = payload.exp * 1000;

  if (Date.now() >= expiry) {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');

    window.location.href = 'login.html';
  }
} catch (error) {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');

  window.location.href = 'login.html';
}
