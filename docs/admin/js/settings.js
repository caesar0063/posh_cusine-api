/* =========================================
   AUTHENTICATION
========================================= */

if (!token) {
  location.href = 'login.html';
}

/* =========================================
   LOAD ADMIN DATA
========================================= */

const admin = JSON.parse(localStorage.getItem('admin'));

const adminNameInput = document.getElementById('adminNameInput');

const adminEmail = document.getElementById('adminEmail');

if (admin) {
  adminNameInput.value = admin.name;

  adminEmail.value = admin.email;
}

/* =========================================
   LOGOUT
========================================= */

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');

    localStorage.removeItem('admin');

    location.href = 'login.html';
  });
}

/* =========================================
   PROFILE UPDATE
========================================= */

const profileForm = document.getElementById('profileForm');

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = adminNameInput.value.trim();

  if (!name) {
    alert('Name is required.');

    return;
  }

  try {
    const result = await api(
      '/auth/profile',

      {
        method: 'PATCH',

        body: JSON.stringify({
          name,
        }),
      }
    );

    localStorage.setItem(
      'admin',

      JSON.stringify(result.data)
    );

    adminNameInput.value = result.data.name;

    alert('Profile updated successfully.');
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
});

/* =========================================
   PASSWORD UPDATE
========================================= */

const passwordForm = document.getElementById('passwordForm');

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;

  const newPassword = document.getElementById('newPassword').value;

  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match.');

    return;
  }

  try {
    const result = await api(
      '/auth/password',

      {
        method: 'PATCH',

        body: JSON.stringify({
          currentPassword,

          newPassword,
        }),
      }
    );

    alert(result.message);

    passwordForm.reset();
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
});

/* =========================================
   SYSTEM PREFERENCES
========================================= */

const emailNotification = document.getElementById('emailNotification');

const reservationAlert = document.getElementById('reservationAlert');

/* =========================================
   LOAD PREFERENCES
========================================= */

async function loadPreferences() {
  try {
    const result = await api('/auth/preferences');

    const preferences = result.data;

    emailNotification.checked = preferences.emailNotifications;

    reservationAlert.checked = preferences.reservationAlerts;
  } catch (error) {
    console.error(
      'Preferences load error:',

      error
    );
  }
}

/* =========================================
   SAVE PREFERENCES
========================================= */

async function savePreferences() {
  try {
    const result = await api(
      '/auth/preferences',

      {
        method: 'PATCH',

        body: JSON.stringify({
          emailNotifications: emailNotification.checked,

          reservationAlerts: reservationAlert.checked,
        }),
      }
    );

    alert(result.message);
  } catch (error) {
    console.error(
      'Preferences update error:',

      error
    );
  }
}

emailNotification.addEventListener(
  'change',

  savePreferences
);

reservationAlert.addEventListener(
  'change',

  savePreferences
);

/* =========================================
   INITIALIZE
========================================= */

loadPreferences();
