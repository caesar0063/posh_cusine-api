const form = document.getElementById('loginForm');

const button = document.getElementById('loginBtn');

const errorMessage = document.getElementById('loginError');


const API_URL = 
  'https://posh-cusine-api.onrender.com/api/v1/auth/login';


// =========================
// LOGIN
// =========================

if (form) {

  let isLoggingIn = false;


  form.addEventListener('submit', async (e) => {

    e.preventDefault();


    if (isLoggingIn) {
      return;
    }


    isLoggingIn = true;


    if (button) {

      button.disabled = true;

      button.textContent = 'Logging in...';

    }


    if (errorMessage) {

      errorMessage.textContent = '';

    }


    const email = document
      .getElementById('email')
      .value
      .trim()
      .toLowerCase();


    const password = document
      .getElementById('password')
      .value;



    try {

      const response = await fetch(API_URL, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json'

        },

        body: JSON.stringify({

          email,

          password

        })

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(
          data.message || 'Login failed'
        );

      }



      const payload = data.data || data;



      if (!payload.token) {

        throw new Error(
          'Login failed. No token received.'
        );

      }



      localStorage.setItem(
        'token',
        payload.token
      );


      localStorage.setItem(
        'admin',
        JSON.stringify(payload.admin)
      );



      window.location.href = 'dashboard.html';



    } catch (error) {


      console.error(
        'Login Error:',
        error
      );


      if (errorMessage) {

        errorMessage.textContent =
          error.message;

      } else {

        alert(error.message);

      }


    } finally {


      isLoggingIn = false;



      if (button) {

        button.disabled = false;

        button.textContent = 'Login';

      }


    }


  });


}