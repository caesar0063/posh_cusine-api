const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,

      trim: true,
    },

    category: {
      type: String,

      enum: ['Appetizer', 'Main Course', 'Dessert', 'Drinks'],

      required: true,
    },

    description: {
      type: String,

      trim: true,
    },

    price: {
      type: Number,

      required: true,

      min: 0,
    },

    image: {
      type: String,

      default: '',
    },

    availability: {
      type: String,

      enum: ['Available', 'Out of Stock'],

      default: 'Available',
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Menu', menuSchema);
