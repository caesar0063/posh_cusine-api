const API_BASE = 'http://localhost:5000/api/v1';

// =========================
// GET TOKEN
// =========================

function getToken() {
  return localStorage.getItem('token');
}

// =========================
// LOGOUT
// =========================

function logout() {
  localStorage.removeItem('token');

  localStorage.removeItem('admin');

  window.location.replace('login.html');
}

// =========================
// API REQUEST HELPER
// =========================

async function api(endpoint, options = {}) {
  const token = getToken();

  // =========================
  // BLOCK UNAUTHORIZED REQUEST
  // =========================

  if (!token) {
    logout();

    return;
  }

  console.log('Calling API:', `${API_BASE}${endpoint}`);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // =========================
  // CONTENT TYPE
  // =========================

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,

    {
      ...options,

      headers: {
        ...headers,

        ...(options.headers || {}),
      },
    }
  );

  // =========================
  // READ RESPONSE
  // =========================

  const data = await response.json();

  console.log(data);

  // =========================
  // TOKEN EXPIRED / INVALID
  // =========================

  if (response.status === 401) {
    logout();

    return;
  }

  // =========================
  // OTHER API ERRORS
  // =========================

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}
