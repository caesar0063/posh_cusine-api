// ======================================
// Authentication
// ======================================

if (!token) {
  location.href = 'login.html';
}

// ======================================
// DOM Elements
// ======================================

const menuModal = document.getElementById('menuModal');
const addMenuBtn = document.getElementById('addMenuBtn');
const closeModal = document.querySelector('.close-modal');
const menuForm = document.getElementById('menuForm');
const modalTitle = document.getElementById('modalTitle');

const menuTable = document.getElementById('menuTable');
const pagination = document.getElementById('pagination');

const searchInput = document.getElementById('searchMenu');
const categoryFilter = document.getElementById('categoryFilter');

// ======================================
// State
// ======================================

let currentPage = 1;
const limit = 10;

let currentSearch = '';
let currentCategory = '';

let allMenuItems = [];

let editMode = false;
let editId = null;

// ======================================
// Initial Load
// ======================================

loadMenuItems();

// ======================================
// Load Menu Items
// ======================================

async function loadMenuItems() {
  try {
    menuTable.innerHTML = `

            <tr>
                <td colspan="6" style="text-align:center;padding:40px;">
                    Loading menu...
                </td>
            </tr>

        `;

    const url =
      `/menu?page=${currentPage}` +
      `&limit=${limit}` +
      `&search=${encodeURIComponent(currentSearch)}` +
      `&category=${encodeURIComponent(currentCategory)}`;

    console.log(url);

    const result = await api(url);

    allMenuItems = result.data;

    displayMenu(allMenuItems);

    createPagination(result.pages);
  } catch (error) {
    console.error(error);

    menuTable.innerHTML = `

            <tr>
                <td colspan="6" style="text-align:center;padding:40px;">
                    Failed to load menu items.
                </td>
            </tr>

        `;
  }
}

// ======================================
// Display Menu
// ======================================

function displayMenu(items) {
  console.log('DISPLAY MENU:', items);

  if (!items.length) {
    menuTable.innerHTML = `

            <tr>
                <td colspan="6" style="text-align:center;padding:40px;">
                    No menu items found.
                </td>
            </tr>

        `;

    return;
  }

  menuTable.innerHTML = items
    .map(
      (item) => `

        <tr>

            <td>

                <img
                    src="${
                      item.image
  ? `https://posh-cusine-api.onrender.com/uploads/menu/${item.image}`
  : 'https://placehold.co/80x80'
                    }"
                    width="70"
                    height="70"
                    style="object-fit:cover;border-radius:10px;"
                    alt="${item.name}"
                >

            </td>

            <td>${item.name}</td>

            <td>${item.category}</td>

            <td>₦${Number(item.price).toLocaleString()}</td>

            <td>

                <span class="status ${
                  item.availability === 'Available' ? 'confirmed' : 'cancelled'
                }">

                    ${item.availability}

                </span>

            </td>

            <td class="actions">

                <button
                    class=" edit-btn"
                    data-id="${item._id}"
                    title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="delete-btn"
                    data-id="${item._id}"
                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

    `
    )
    .join('');
}

// ======================================
// Search & Filters
// ======================================

function applyFilters() {
  currentSearch = searchInput.value.trim();

  currentCategory = categoryFilter.value;

  currentPage = 1;

  loadMenuItems();
}

searchInput.addEventListener('input', applyFilters);

categoryFilter.addEventListener('change', applyFilters);

// ======================================
// Pagination
// ======================================

function createPagination(totalPages) {
  pagination.innerHTML = '';

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');

    button.textContent = i;

    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentPage = i;

      loadMenuItems();
    });

    pagination.appendChild(button);
  }
}

// ======================================
// Modal Controls
// ======================================

addMenuBtn.addEventListener('click', () => {
  editMode = false;

  editId = null;

  modalTitle.textContent = 'Add Menu Item';

  menuForm.reset();

  menuModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
  menuModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
  if (e.target === menuModal) {
    menuModal.classList.remove('active');
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

// ======================================
// Event Delegation
// ======================================

menuTable.addEventListener('click', (e) => {
  const button = e.target.closest('button');

  if (!button) return;

  const id = button.dataset.id;

  if (button.classList.contains('edit-btn')) {
    editMenu(id);

    return;
  }

  if (button.classList.contains('delete-btn')) {
    deleteMenu(id);
  }
});

// ======================================
// Edit Menu Item
// ======================================

function editMenu(id) {
  const item = allMenuItems.find((menu) => menu._id === id);

  if (!item) return;

  editMode = true;

  editId = id;

  modalTitle.textContent = 'Edit Menu Item';

  document.getElementById('foodName').value = item.name;

  document.getElementById('category').value = item.category;

  document.getElementById('description').value = item.description;

  document.getElementById('price').value = item.price;

  document.getElementById('availability').value = item.availability;

  document.getElementById('image').value = '';

  menuModal.classList.add('active');
}

// ======================================
// Save Menu Item
// ======================================

menuForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  console.log('FORM SUBMITTED');

  console.log('editMode =', editMode);

  console.log('editId =', editId);

  try {
    const formData = new FormData();

    formData.append('name', document.getElementById('foodName').value.trim());

    formData.append('category', document.getElementById('category').value);

    formData.append('description', document.getElementById('description').value.trim());

    formData.append('price', document.getElementById('price').value);

    formData.append('availability', document.getElementById('availability').value);

    const imageInput = document.getElementById('image');

    if (imageInput.files.length > 0) {
      formData.append('image', imageInput.files[0]);
    }

    console.log('About to save...');
    if (editMode) {
      console.log('PATCH request');
      await api(`/menu/${editId}`, {
        method: 'PATCH',
        body: formData,
      });

      showToast('Menu item updated successfully.', '#28a745');
    } else {
      await api('/menu', {
        method: 'POST',
        body: formData,
      });

      showToast('Menu item added successfully.', '#28a745');
    }

    menuForm.reset();

    editMode = false;
    editId = null;

    menuModal.classList.remove('active');

    loadMenuItems();
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
});

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

// ======================================
// Delete Menu
// ======================================

async function deleteMenu(id) {
  openConfirmModal(
    'Delete Menu Item',

    'This menu item will be permanently deleted. This action cannot be undone.',

    async () => {
      try {
        await api(`/menu/${id}`, {
          method: 'DELETE',
        });

        showToast(
          'Menu item deleted successfully.',

          '#dc3545'
        );

        loadMenuItems();
      } catch (error) {
        console.error(error);

        alert(error.message);
      }
    }
  );
}
