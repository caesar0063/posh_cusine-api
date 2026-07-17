const mongoose = require('mongoose');

const { TABLE_STATUS } = require('../utils/constants');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,

      required: true,

      unique: true,

      trim: true,
    },

    capacity: {
      type: Number,

      required: true,

      min: 1,
    },

    status: {
      type: String,

      enum: [
        TABLE_STATUS.AVAILABLE,
        TABLE_STATUS.RESERVED,
        TABLE_STATUS.OCCUPIED,
        TABLE_STATUS.MAINTENANCE,
      ],

      default: TABLE_STATUS.AVAILABLE,
    },
  },

  {
    timestamps: true,
  }
);

// =========================
// Indexes
// =========================

tableSchema.index({ status: 1 });
tableSchema.index({ capacity: 1 });

module.exports = mongoose.model('Table', tableSchema);
