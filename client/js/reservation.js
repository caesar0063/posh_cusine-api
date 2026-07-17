const API = 'http://localhost:5000/api/v1/reservations';

const form = document.getElementById('reservationForm');

const toast = document.getElementById('toast');

const button = document.getElementById('reserveBtn');

// =========================
// Prevent Past Reservations
// =========================

const dateInput = document.getElementById('reservationDate');

if (dateInput) {
  const today = new Date().toISOString().split('T')[0];

  dateInput.min = today;
}

// =========================
// Toast
// =========================

function showToast(message, color = '#28a745') {
  if (!toast) {
    alert(message);

    return;
  }

  toast.textContent = message;

  toast.style.background = color;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// =========================
// Submit Reservation
// =========================

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  button.disabled = true;

  button.textContent = 'Submitting...';

  const reservation = {
    fullName: document.getElementById('fullName').value.trim(),

    phone: document.getElementById('phone').value.trim(),

    email: document.getElementById('email').value.trim(),

    guests: document.getElementById('guests').value,

    reservationDate: document.getElementById('reservationDate').value,

    reservationTime: document.getElementById('reservationTime').value,

    specialRequest: document.getElementById('specialRequest').value.trim(),
  };

  // Required fields validation

  if (
    !reservation.fullName ||
    !reservation.phone ||
    !reservation.guests ||
    !reservation.reservationDate ||
    !reservation.reservationTime
  ) {
    showToast('Please complete all required fields.', '#dc3545');

    button.disabled = false;

    button.textContent = 'Reserve Table';

    return;
  }

  // Phone validation

  const phonePattern = /^[0-9+\s-]{10,15}$/;

  if (!phonePattern.test(reservation.phone)) {
    showToast('Enter a valid phone number.', '#dc3545');

    button.disabled = false;

    button.textContent = 'Reserve Table';

    return;
  }

  // Send to backend

  try {
    const response = await fetch(API, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(reservation),
    });

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error('Invalid server response');
    }

    if (result.success) {
      showToast('Reservation submitted successfully.');

      form.reset();
    } else {
      showToast(result.message || 'Reservation failed.', '#dc3545');
    }
  } catch (error) {
    console.error(error);

    showToast(error.message || 'Server unavailable. Try again later.', '#dc3545');
  }

  button.disabled = false;

  button.textContent = 'Reserve Table';
});
