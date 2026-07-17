const mongoose = require('mongoose');
require('dotenv').config();

const Reservation = require('../models/reservationModel');

const reservations = [
  {
    fullName: 'John Smith',
    phone: '08011111111',
    email: 'john@gmail.com',
    guests: 2,
    reservationDate: new Date('2026-07-15'),
    reservationTime: '18:00',
    specialRequest: 'Window seat',
    status: 'Pending',
  },

  {
    fullName: 'Sarah Williams',
    phone: '08022222222',
    email: 'sarah@gmail.com',
    guests: 6,
    reservationDate: new Date('2026-07-15'),
    reservationTime: '19:30',
    specialRequest: 'Birthday dinner',
    status: 'Pending',
  },

  {
    fullName: 'Michael Johnson',
    phone: '08033333333',
    email: 'michael@gmail.com',
    guests: 10,
    reservationDate: new Date('2026-07-16'),
    reservationTime: '20:00',
    specialRequest: 'Large table',
    status: 'Pending',
  },

  {
    fullName: 'Grace Anderson',
    phone: '08044444444',
    email: 'grace@gmail.com',
    guests: 4,
    reservationDate: new Date('2026-07-16'),
    reservationTime: '18:30',
    specialRequest: '',
    status: 'Confirmed',
  },

  {
    fullName: 'David Brown',
    phone: '08055555555',
    email: 'david@gmail.com',
    guests: 12,
    reservationDate: new Date('2026-07-17'),
    reservationTime: '21:00',
    specialRequest: 'Business meeting',
    status: 'Pending',
  },
];

const createReservations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected');

    await Reservation.insertMany(reservations);

    console.log('Reservations created');

    process.exit();
  } catch (error) {
    console.log(error.message);

    process.exit(1);
  }
};

createReservations();
