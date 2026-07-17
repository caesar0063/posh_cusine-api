const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,

    required: true,
  },

  email: {
    type: String,

    required: true,

    unique: true,

    lowercase: true,

    trim: true,
  },

  password: {
    type: String,

    required: true,
  },

  emailNotifications: {
    type: Boolean,

    default: true,
  },

  reservationAlerts: {
    type: Boolean,

    default: true,
  },
});

module.exports = mongoose.model(
  'Admin',

  adminSchema
);
