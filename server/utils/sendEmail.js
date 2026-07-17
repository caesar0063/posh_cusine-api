const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReservationEmail = async (reservation) => {
  // Restaurant notification
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: '🍽 New Reservation',
    html: `
      <h2>New Reservation Received</h2>
      <p><strong>Name:</strong> ${reservation.fullName}</p>
      <p><strong>Phone:</strong> ${reservation.phone}</p>
      <p><strong>Email:</strong> ${reservation.email}</p>
      <p><strong>Guests:</strong> ${reservation.guests}</p>
      <p><strong>Date:</strong> ${new Date(reservation.reservationDate).toDateString()}</p>
      <p><strong>Time:</strong> ${reservation.reservationTime}</p>
      <p><strong>Special request:</strong> ${reservation.specialRequest || 'None'}</p>
    `,
  });

  // Customer confirmation
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: reservation.email,
    subject: '🍽 Reservation Received',
    html: `
      <h2>Hi ${reservation.fullName},</h2>
      <p>Thanks for choosing us. Your reservation has been received.</p>
      <p><strong>Date:</strong> ${new Date(reservation.reservationDate).toDateString()}</p>
      <p><strong>Time:</strong> ${reservation.reservationTime}</p>
      <p><strong>Guests:</strong> ${reservation.guests}</p>
      <p>We look forward to welcoming you.</p>
    `,
  });
};

module.exports = sendReservationEmail;