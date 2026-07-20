// ===============================
// Authentication
// ===============================

if (!token) {
  location.href = 'login.html';
}

// ===============================
// Variables
// ===============================

let currentPage = 1;

const limit = 10;

let allTables = [];

let currentSearch = '';

let currentStatus = '';

const modal = document.getElementById('tableModal');

const closeModal = document.querySelector('.close-modal');

const addTableBtn = document.getElementById('addTableBtn');

const tableForm = document.getElementById('tableForm');

const modalTitle = document.getElementById('modalTitle');

const searchInput = document.getElementById('searchTable');

const statusFilter = document.getElementById('statusFilter');

let editMode = false;

let editId = null;

// ===============================
// Load Tables
// ===============================

loadTables();

async function loadTables() {
  try {
    document.getElementById('tableList').innerHTML = `

<tr>

<td colspan="4" style="text-align:center;padding:40px;">

Loading tables...

</td>

</tr>

`;

    const result = await api(
      `/tables?page=${currentPage}` +
        `&limit=${limit}` +
        `&search=${encodeURIComponent(currentSearch)}` +
        `&status=${encodeURIComponent(currentStatus)}`
    );

    allTables = result.data;
    console.log('TABLE API RESPONSE:', result.data);
    displayTables(allTables);

    createPagination(result.pages);
  } catch (error) {
    console.error(error);
  }
}

function applyFilters() {
  currentSearch = searchInput.value.trim();

  currentStatus = statusFilter.value;

  currentPage = 1;

  loadTables();
}

searchInput.addEventListener('input', applyFilters);

statusFilter.addEventListener('change', applyFilters);

// ===============================
// Display Tables
// ===============================

function displayTables(tables) {
  const tableBody = document.getElementById('tableList');

  if (!tables.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:40px;">
          No tables found.
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML = '';

  tables.forEach((table) => {
    const reservations = table.reservations || [];

    const reservationInfo = reservations.length
      ? `
        <div class="table-reservation-info">

          <strong>
            ${reservations.length}
            reservation${reservations.length > 1 ? 's' : ''}
          </strong>

          <div class="reservation-list">

            ${reservations
              .map(
                (reservation) => `
                  <div class="reservation-item">

                    <strong>
                      ${reservation.time}
                    </strong>

                    <span>
                      ${reservation.customer}
                    </span>

                  </div>
                `
              )
              .join('')}

          </div>

        </div>
      `
      : '';

    tableBody.innerHTML += `
      <tr>

        <td>
          <strong>${table.tableNumber}</strong>
        </td>

        <td>
          ${table.capacity}
        </td>

        <td>

          <span class="status ${table.displayStatus.toLowerCase()}">
            ${table.displayStatus}
          </span>

          ${reservationInfo}

        </td>

        <td class="actions">

          <button
            class="edit-btn"
            data-id="${table._id}"
            title="Edit">

            <i class="fa-solid fa-pen"></i>

          </button>

          <button
            class="delete-btn"
            data-id="${table._id}"
            title="Delete">

            <i class="fa-solid fa-trash"></i>

          </button>

        </td>

      </tr>
    `;
  });
}


// ===============================
// Table Actions
// ===============================

const tableBody = document.getElementById('tableList');

tableBody.addEventListener('click', (e) => {
  const button = e.target.closest('button');

  if (!button) return;

  const id = button.dataset.id;

  if (button.classList.contains('edit-btn')) {
    editTable(id);

    return;
  }

  if (button.classList.contains('delete-btn')) {
    deleteTable(id);
  }
});


// ===============================
// Pagination
// ===============================

function createPagination(totalPages) {
  const container = document.getElementById('pagination');

  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');

    button.textContent = i;

    if (i === currentPage) {
      button.classList.add('active');
    }

    button.onclick = () => {
      currentPage = i;

      loadTables();
    };

    container.appendChild(button);
  }
}

// ===============================
// Temporary Functions
// ===============================

function editTable(id) {
  const table = allTables.find((t) => t._id === id);

  if (!table) return;

  editMode = true;

  editId = id;

  modalTitle.textContent = 'Edit Table';

  document.getElementById('tableNumber').value = table.tableNumber;

  document.getElementById('capacity').value = table.capacity;

  document.getElementById('status').value = table.status;

  modal.classList.add('active');
}

function showToast(message, color = '#28a745') {
  let toast = document.querySelector('.toast');

  if (!toast) {
    toast = document.createElement('div');

    toast.className = 'toast';

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.style.background = color;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function deleteTable(id) {
  openConfirmModal(
    'Delete Table',

    'This table will be permanently deleted.',

    async () => {
      await api(`/tables/${id}`, {
        method: 'DELETE',
      });

      showToast(
        'Table deleted successfully.',

        '#dc3545'
      );

      loadTables();
    }
  );
}

// ===============================
// Modal Controls
// ===============================

addTableBtn.addEventListener('click', () => {
  editMode = false;

  editId = null;

  modalTitle.textContent = 'Add Table';

  tableForm.reset();

  modal.classList.add('active');
});

closeModal.addEventListener('click', () => {
  modal.classList.remove('active');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// ======================================
// Confirmation Modal
// ======================================

const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmButton = document.getElementById('confirmAction');
const cancelButton = document.getElementById('cancelAction');

let confirmCallback = null;

function openConfirmModal(title, message, callback) {
  confirmTitle.textContent = title;

  confirmMessage.textContent = message;

  confirmCallback = callback;

  confirmModal.classList.add('active');
}

cancelButton.addEventListener('click', () => {
  confirmModal.classList.remove('active');
});

confirmButton.addEventListener('click', () => {
  confirmModal.classList.remove('active');

  if (confirmCallback) {
    confirmCallback();
  }
});

// ===============================
// Save Table
// ===============================

tableForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const payload = {
      tableNumber: document.getElementById('tableNumber').value,

      capacity: document.getElementById('capacity').value,

      status: document.getElementById('status').value,
    };

    if (editMode) {
      await api(`/tables/${editId}`, {
        method: 'PATCH',

        body: JSON.stringify(payload),
      });
    } else {
      await api('/tables', {
        method: 'POST',

        body: JSON.stringify(payload),
      });
    }

    showToast(
      editMode ? 'Table updated successfully.' : 'Table added successfully.',

      '#28a745'
    );

    modal.classList.remove('active');

    tableForm.reset();

    editMode = false;

    editId = null;

    loadTables();
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
});
