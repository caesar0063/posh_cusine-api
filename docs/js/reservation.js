console.log("CUSTOMER RESERVATION JS LOADED");

const API_URL =
  'https://posh-cusine-api.onrender.com/api/v1/reservations';


const form = document.getElementById('reservationForm');

const toast = document.getElementById('toast');

const button = document.getElementById('reserveBtn');


// Stop if reservation form is not on page
if (!form) {
  console.error('Reservation form not found');
} else {


  // =========================
  // Prevent Past Reservations
  // =========================

  const dateInput = document.getElementById('reservationDate');


  if (dateInput) {

    const today = new Date()
      .toISOString()
      .split('T')[0];

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


    if(button){

      button.disabled = true;

      button.textContent = 'Submitting...';

    }



    const reservation = {


      fullName:
      document.getElementById('fullName').value.trim(),


      phone:
      document.getElementById('phone').value.trim(),


      email:
      document.getElementById('email').value.trim(),


      guests:
      document.getElementById('guests').value,


      reservationDate:
      document.getElementById('reservationDate').value,


      reservationTime:
      document.getElementById('reservationTime').value,


      specialRequest:
      document.getElementById('specialRequest').value.trim()

    };




    // Required fields

    if(
      !reservation.fullName ||
      !reservation.phone ||
      !reservation.guests ||
      !reservation.reservationDate ||
      !reservation.reservationTime
    ){

      showToast(
        'Please complete all required fields.',
        '#dc3545'
      );


      resetButton();

      return;

    }





    // Phone validation

    const phonePattern = /^[0-9+\s-]{10,15}$/;


    if(!phonePattern.test(reservation.phone)){


      showToast(
        'Enter a valid phone number.',
        '#dc3545'
      );


      resetButton();

      return;

    }





    try {


      console.log(
        'Sending reservation:',
        reservation
      );


      const response = await fetch(API_URL, {


        method:'POST',


        headers:{


          'Content-Type':'application/json'


        },


        body:JSON.stringify(reservation)


      });




      const result = await response.json();




      if(response.ok && result.success){


        showToast(
          'Reservation submitted successfully.'
        );


        form.reset();


      }else{


        showToast(
          result.message || 'Reservation failed.',
          '#dc3545'
        );


      }





    } catch(error){


      console.error(
        'Reservation Error:',
        error
      );


      showToast(
        'Server unavailable. Try again later.',
        '#dc3545'
      );


    }



    resetButton();


  });



}





function resetButton(){


  if(button){


    button.disabled = false;


    button.textContent = 'Reserve Table';


  }


}