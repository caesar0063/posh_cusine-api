const API_BASE_URL =
  'https://posh-cusine-api.onrender.com/api/v1';

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

  console.log(
    'Calling API:',
    `${API_BASE_URL}${endpoint}`
  );

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
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...headers,

        ...(options.headers || {}),
      },
    }
  );

  const contentType =
    response.headers.get('content-type') || '';

  let data;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      `API returned a non-JSON response (${response.status}): ${text.slice(
        0,
        100
      )}`
    );
  }

  console.log(data);

  if (response.status === 401) {
    logout();

    return;
  }

  if (!response.ok) {
    throw new Error(
      data.message || 'Something went wrong'
    );
  }

  return data;
}