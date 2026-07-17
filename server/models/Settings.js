const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: 'Posh Cuisine',
    },

    tagline: {
      type: String,
      default: 'Premium Dining Experience',
    },

    phone: {
      type: String,
      default: '',
    },

    email: {
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
    },

    openingHours: {
      type: String,
      default: '',
    },

    about: {
      type: String,
      default: '',
    },

    logo: {
      type: String,
      default: '',
    },

    heroImage: {
      type: String,
      default: '',
    },

    instagram: {
      type: String,
      default: '',
    },

    facebook: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
