console.log("ADMIN RESERVATION JS LOADED");

/* ===========================================
   AUTHENTICATION
=========================================== */

if (!token) {
  location.href = 'login.html';
}

/* ===========================================
   GLOBAL STATE
=========================================== */

let allReservations = [];

let currentPage = 1;

const limit = 10;

let currentSearch = '';

let currentStatus = '';

let currentSort = 'newest';

/* ===========================================
   DOM ELEMENTS
=========================================== */

const reservationTable = document.getElementById('reservationTable');

const searchInput = document.getElementById('searchInput');

const statusFilter = document.getElementById('statusFilter');

const sortFilter = document.getElementById('sortFilter');

const pagination = document.getElementById('pagination');

const toast = document.getElementById('toast');

const modal = document.getElementById('reservationModal');

const modalBody = document.getElementById('modalBody');

const closeModal = document.querySelector('.close-modal');

const confirmModal = document.getElementById('confirmModal');

const confirmTitle = document.getElementById('confirmTitle');

const confirmMessage = document.getElementById('confirmMessage');

const confirmButton = document.getElementById('confirmAction');

const cancelButton = document.getElementById('cancelAction');

let confirmCallback = null;

/* ===========================================
   INITIALIZE
=========================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadReservations();
});

/* ===========================================
   LOAD RESERVATIONS
=========================================== */

async function loadReservations() {
  reservationTable.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:40px;">
                Loading reservations...
            </td>
        </tr>
    `;

  try {
    const result = await api(
      `/reservations?page=${currentPage}` +
        `&limit=${limit}` +
        `&search=${encodeURIComponent(currentSearch)}` +
        `&status=${encodeURIComponent(currentStatus)}` +
        `&sort=${encodeURIComponent(currentSort)}`
    );

    allReservations = result.data || [];

    renderReservations();

    renderPagination(result.pages);
  } catch (error) {
    console.error(error);

    showToast(error.message, '#dc3545');
  }
}

/* ===========================================
   RENDER TABLE
=========================================== */

function renderReservations() {
  if (!allReservations.length) {
    reservationTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:40px;">
                    No reservations found.
                </td>
            </tr>
        `;

    return;
  }

  let html = '';

  allReservations.forEach((r) => {
    html += `

<tr>

<td>${r.fullName}</td>

<td>${r.phone}</td>

<td>${r.guests}</td>

<td>${new Date(r.reservationDate).toLocaleDateString()}</td>

<td>

<span class="status ${r.status.toLowerCase()}">

${r.status}

</span>

</td>

<td class="actions">

  <button
    class="view-btn"
    onclick="viewReservation('${r._id}')">

    <i class="fa-solid fa-eye"></i>

  </button>

  ${
    r.status === 'Pending' && r.assignedTable
      ? `
        <button
          class="confirm-btn"
          onclick="updateStatus('${r._id}', 'Confirmed')">

          <i class="fa-solid fa-check"></i>

        </button>
      `
      : ''
  }

  ${
    r.status === 'Confirmed'
      ? `
        <button
          class="seat-btn"
          onclick="updateStatus('${r._id}', 'Seated')">

          <i class="fa-solid fa-chair"></i>

        </button>
      `
      : ''
  }

  ${
    r.status === 'Seated'
      ? `
        <button
          class="complete-btn"
          onclick="updateStatus('${r._id}', 'Completed')">

          <i class="fa-solid fa-circle-check"></i>

        </button>
      `
      : ''
  }

  ${
    r.status !== 'Cancelled' &&
    r.status !== 'Completed'
      ? `
        <button
          class="cancel-btn"
          onclick="updateStatus('${r._id}', 'Cancelled')">

          <i class="fa-solid fa-xmark"></i>

        </button>
      `
      : ''
  }

  <button
    class="delete-btn"
    onclick="deleteReservation('${r._id}')">

    <i class="fa-solid fa-trash"></i>

  </button>

</td>

</tr>

`;
  });

  reservationTable.innerHTML = html;
}

/* ===========================================
   FILTERS
=========================================== */

let searchTimer;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    applyFilters();
  }, 300);
});

statusFilter.addEventListener('change', applyFilters);

sortFilter.addEventListener('change', applyFilters);

function applyFilters() {
  currentSearch = searchInput.value.trim();

  currentStatus = statusFilter.value;

  currentSort = sortFilter.value;

  currentPage = 1;

  loadReservations();
}

/* ===========================================
   PAGINATION
=========================================== */

function renderPagination(totalPages) {
  pagination.innerHTML = '';

  if (!totalPages || totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');

    button.textContent = i;

    if (i === currentPage) {
      button.classList.add('active');
    }

    button.onclick = () => {
      currentPage = i;

      loadReservations();
    };

    pagination.appendChild(button);
  }
}

/* ===========================================
   VIEW RESERVATION
=========================================== */

async function viewReservation(id) {
  const reservation = allReservations.find((r) => r._id === id);

  console.log('Selected reservation:', reservation);

  if (!reservation) {
    showToast('Reservation not found.', '#dc3545');

    return;
  }

  try {
    const reservationDate = new Date(reservation.reservationDate).toISOString().split('T')[0];

   const tableResult = await api(
  `/tables/status/available?date=${reservationDate}` +
    `&time=${encodeURIComponent(reservation.reservationTime)}` +
    `&reservationId=${reservation._id}`
);

    let availableTables = tableResult.data || [];
    console.log('Available table list:', availableTables);
    console.log('Number of tables:', availableTables.length);

    modalBody.innerHTML = `

<div class="detail-row">

<span class="detail-label">

Customer

</span>

<span class="detail-value">

${reservation.fullName}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Phone

</span>

<span class="detail-value">

${reservation.phone}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Email

</span>

<span class="detail-value">

${reservation.email || '-'}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Guests

</span>

<span class="detail-value">

${reservation.guests}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Reservation Date

</span>

<span class="detail-value">

${new Date(reservation.reservationDate).toLocaleDateString()}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Time

</span>

<span class="detail-value">

${reservation.reservationTime}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Special Request

</span>

<span class="detail-value">

${reservation.specialRequest || 'None'}

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Status

</span>

<span class="detail-value">

<span class="status ${reservation.status.toLowerCase()}">

${reservation.status}

</span>

</span>

</div>


<div class="detail-row">

<span class="detail-label">

Assigned Table

</span>

<span class="detail-value">

<select id="tableSelect">

<option value="">

-- Select Table --

</option>

${availableTables
  .map((table) => {
    const selected =
      reservation.assignedTable && table._id === reservation.assignedTable._id ? 'selected' : '';

    return `

<option

value="${table._id}"

${selected}

>

${table.tableNumber}

(${table.capacity} Seats)

</option>

`;
  })
  .join('')}

</select>

</span>

</div>


${
  reservation.status === 'Pending' ||
  reservation.status === 'Confirmed'
    ? `
      <div style="margin-top:25px">

        <button
          class="confirm-btn"
          onclick="assignTable('${reservation._id}')">

          ${
            reservation.assignedTable
              ? 'Change Table'
              : 'Assign Table'
          }

        </button>

      </div>
    `
    : ''
}

`;

    modal.classList.add('active');
  } catch (error) {
    console.error(error);

    showToast(error.message, '#dc3545');
  }
}

/* ===========================================
   CLOSE MODAL
=========================================== */

closeModal.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

/* ===========================================
   ASSIGN TABLE
=========================================== */

async function assignTable(reservationId) {
  const tableId = document.getElementById('tableSelect').value;

  if (!tableId) {
    showToast('Please select a table.', '#dc3545');

    return;
  }

  try {
    await api(
      `/reservations/${reservationId}`,

      {
        method: 'PATCH',

        body: JSON.stringify({
          assignedTable: tableId,
        }),
      }
    );

    modal.classList.remove('active');

    showToast('Table assigned successfully.');

    loadReservations();
  } catch (error) {
    console.error(error);

    showToast(error.message, '#dc3545');
  }
}

/* ===========================================
   CONFIRMATION MODAL
=========================================== */

function openConfirmModal(title, message, callback) {
  confirmTitle.textContent = title;

  confirmMessage.textContent = message;

  confirmCallback = callback;

  confirmModal.classList.add('active');
}

cancelButton.addEventListener('click', () => {
  confirmModal.classList.remove('active');

  confirmCallback = null;
});

confirmButton.addEventListener('click', async () => {
  confirmModal.classList.remove('active');

  if (!confirmCallback) return;

  try {
    await confirmCallback();
  } finally {
    confirmCallback = null;
  }
});

/* ===========================================
   UPDATE STATUS
=========================================== */

async function updateStatus(id, status) {
  let confirmText = '';

  if (status === 'Confirmed') {
    confirmText = 'confirm';
  } else if (status === 'Seated') {
    confirmText = 'mark this customer as seated';
  } else if (status === 'Completed') {
    confirmText = 'complete';
  } else if (status === 'Cancelled') {
    confirmText = 'cancel';
  }

  let confirmMessage = '';

  if (status === 'Seated') {
    confirmMessage = 'Are you sure you want to mark this customer as seated?';
  } else {
    confirmMessage = `Are you sure you want to ${confirmText} this reservation?`;
  }

  openConfirmModal(
    `${confirmText.charAt(0).toUpperCase() + confirmText.slice(1)} Reservation`,

    confirmMessage,

    async () => {
      try {
        await api(`/reservations/${id}`, {
          method: 'PATCH',

          body: JSON.stringify({
            status,
          }),
        });

        showToast(
          `Reservation ${status.toLowerCase()}.`,

          status === 'Confirmed' ? '#28a745' : '#ffc107'
        );

        await loadReservations();
      } catch (error) {
        console.error(error);

        showToast(error.message, '#dc3545');
      }
    }
  );
}

/* ===========================================
   DELETE RESERVATION
=========================================== */

async function deleteReservation(id) {
  openConfirmModal(
    'Delete Reservation',

    'This reservation will be permanently deleted. Continue?',

    async () => {
      try {
        await api(`/reservations/${id}`, {
          method: 'DELETE',
        });

        showToast(
          'Reservation deleted.',

          '#dc3545'
        );

        await loadReservations();
      } catch (error) {
        console.error(error);

        showToast(error.message, '#dc3545');
      }
    }
  );
}

/* ===========================================
   TOAST
=========================================== */

function showToast(message, color = '#28a745') {
  toast.textContent = message;

  toast.style.background = color;

  toast.classList.add('show');

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ===========================================
   LOGOUT
=========================================== */

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');

    location.href = 'login.html';
  });
}

/* ===========================================
   GLOBAL FUNCTIONS
=========================================== */

window.viewReservation = viewReservation;

window.updateStatus = updateStatus;

window.deleteReservation = deleteReservation;

window.assignTable = assignTable;
