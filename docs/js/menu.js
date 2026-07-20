const MENU_API_URL =
  'https://posh-cusine-api.onrender.com/api/v1/menu';


const menuGrid = document.getElementById('menu-grid');


if (!menuGrid) {

  console.error('Menu grid not found');

  throw new Error('Missing menu-grid element');

}


let allMenuItems = [];


const filterButtons = document.querySelectorAll('.filter-btn');


// =========================
// LOADING
// =========================

function showLoading() {

  menuGrid.innerHTML = `

    <div class="loading">

      Loading Menu...

    </div>

  `;

}


// =========================
// ERROR
// =========================

function showError() {

  menuGrid.innerHTML = `

    <div class="menu-error">

      Unable to load menu.

    </div>

  `;

}


// =========================
// EMPTY
// =========================

function showEmpty() {

  menuGrid.innerHTML = `

    <div class="menu-empty">

      No meals found.

    </div>

  `;

}


// =========================
// FETCH MENU
// =========================

async function fetchMenu() {

  showLoading();


  try {

   const response = await fetch(MENU_API_URL);


    if (!response.ok) {

      throw new Error('Menu service unavailable');

    }


    const result = await response.json();


    if (result.success) {

      allMenuItems = result.data;

      renderMenu(allMenuItems);

    } else {

      showError();

    }


  } catch (error) {

    console.error('Menu Error:', error);


    menuGrid.innerHTML = `

      <div class="menu-error">

        Unable to load menu.
        Please try again later.

      </div>

    `;

  }

}


// =========================
// RENDER MENU
// =========================

function renderMenu(menuItems) {


  if (!menuItems.length) {

    showEmpty();

    return;

  }


  menuGrid.innerHTML = '';



  menuItems.forEach((item) => {


    const card = document.createElement('div');


    card.className = 'menu-card';



    card.innerHTML = `

      <div class="menu-image">

      <img
       src="${
         item.image
            ? `https://posh-cusine-api.onrender.com/uploads/menu/${item.image}`
            : 'images/placeholder.jpg'
        }"
        alt="${item.name}"
>

      </div>


      <div class="menu-content">


        ${
          item.featured
            ? `<span class="featured">Featured</span>`
            : ''
        }


        <h3>${item.name}</h3>


        <p>${item.description}</p>


        <div class="menu-footer">


          <span class="price">

            ₦${Number(item.price).toLocaleString()}

          </span>



          <span class="${
            item.availability === 'Available'
              ? 'available'
              : 'unavailable'
          }">


            ${
              item.availability === 'Available'
                ? 'Available'
                : 'Sold Out'
            }


          </span>


        </div>


      </div>

    `;



    menuGrid.appendChild(card);


  });


}


// =========================
// FILTERS
// =========================

filterButtons.forEach((button) => {


  button.addEventListener('click', () => {


    filterButtons.forEach((btn) => {

      btn.classList.remove('active');

    });



    button.classList.add('active');



    const category = button.dataset.category;



    if (category === 'all') {

      renderMenu(allMenuItems);

      return;

    }



    const filtered = allMenuItems.filter((item) => {


      const itemCategory = item.category
        .toLowerCase()
        .replace(/\s+/g, '-');


      return itemCategory === category;


    });



    renderMenu(filtered);


  });


});


// =========================
// INITIAL LOAD
// =========================

fetchMenu();