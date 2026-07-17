const mongoose = require('mongoose');

const { RESERVATION_STATUS } = require('../utils/constants');

const reservationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,

      required: true,

      trim: true,
    },

    phone: {
      type: String,

      required: true,

      trim: true,
    },

    email: {
      type: String,

      lowercase: true,

      trim: true,

      default: '',
    },

    guests: {
      type: Number,

      required: true,

      min: 1,

      max: 20,
    },

    reservationDate: {
      type: Date,

      required: true,

      validate: {
        validator: function (value) {
          return value >= new Date();
        },

        message: 'Reservation date cannot be in the past.',
      },
    },

    reservationTime: {
      type: String,

      required: true,
    },

    specialRequest: {
      type: String,

      trim: true,

      default: '',
    },

    status: {
      type: String,

      enum: [
        RESERVATION_STATUS.PENDING,

        RESERVATION_STATUS.CONFIRMED,

        RESERVATION_STATUS.SEATED,

        RESERVATION_STATUS.COMPLETED,

        RESERVATION_STATUS.CANCELLED,
      ],

      default: RESERVATION_STATUS.PENDING,
    },

    assignedTable: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'Table',

      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// =========================
// Indexes
// =========================

reservationSchema.index({ phone: 1 });
reservationSchema.index({ email: 1 });
reservationSchema.index({ reservationDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ assignedTable: 1 });
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({
  assignedTable: 1,
  reservationDate: 1,
  reservationTime: 1,
  status: 1,
});

module.exports = mongoose.model('Reservation', reservationSchema);
