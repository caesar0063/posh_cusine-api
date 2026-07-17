require('dotenv').config();
console.log(process.env.MONGO_URI);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const Admin = require('../models/adminModel');

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({
      email: 'admin@poshcuisine.com',
    });

    if (existingAdmin) {
      console.log('Admin already exists.');

      process.exit();
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    await Admin.create({
      name: 'Administrator',

      email: 'admin@poshcuisine.com'.trim().toLowerCase(),

      password: hashedPassword,
    });

    console.log('Admin created successfully.');

    process.exit();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

createAdmin();
