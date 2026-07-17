/**
 * Table Service
 * Utility functions for table management in reservations
 */

const Table = require('../models/tableModel');
const AppError = require('../utils/AppError');
const { RESERVATION_STATUS, TABLE_STATUS, HTTP_STATUS } = require('../utils/constants');

/**
 * Check if table can be assigned to reservation
 * @param {string} tableId - Table ID
 * @param {number} guestCount - Number of guests
 * @returns {Promise<Object>} Table object if valid
 * @throws {AppError} If table not found or capacity insufficient
 */
const validateTableCapacity = async (tableId, guestCount) => {
  const table = await Table.findById(tableId);

  if (!table) {
    throw new AppError('Selected table not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (table.capacity < guestCount) {
    throw new AppError(
      `Table ${table.tableNumber} can only seat ${table.capacity} guests.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return table;
};

/**
 * Check for double booking on same table, date, and time
 * @param {string} tableId - Table ID
 * @param {Date} reservationDate - Reservation date
 * @param {string} reservationTime - Reservation time
 * @param {string} excludeReservationId - Reservation ID to exclude from check
 * @returns {Promise<Object|null>} Conflicting reservation or null
 */
const checkTableAvailability = async (
  tableId,
  reservationDate,
  reservationTime,
  excludeReservationId
) => {
  const Reservation = require('../models/reservationModel');

  const conflictingReservation = await Reservation.findOne({
    _id: { $ne: excludeReservationId },
    assignedTable: tableId,
    reservationDate,
    reservationTime,
    status: {
      $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.SEATED],
    },
  });

  return conflictingReservation;
};

/**
 * Release table (set to available)
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Updated table
 */
const releaseTable = async (tableId) => {
  if (!tableId) return null;

  return Table.findByIdAndUpdate(tableId, { status: TABLE_STATUS.AVAILABLE }, { new: true });
};

/**
 * Occupy table (set to occupied)
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Updated table
 */
const occupyTable = async (tableId) => {
  if (!tableId) return null;

  return Table.findByIdAndUpdate(tableId, { status: TABLE_STATUS.OCCUPIED }, { new: true });
};

/**
 * Handle table status change based on reservation status
 * @param {string} tableId - Table ID
 * @param {string} status - Reservation status
 * @returns {Promise<void>}
 */
const updateTableStatusByReservation = async (tableId, status) => {
  if (!tableId) return;

  if (status === RESERVATION_STATUS.COMPLETED || status === RESERVATION_STATUS.CANCELLED) {
    await releaseTable(tableId);
  } else if (status === RESERVATION_STATUS.SEATED) {
    await occupyTable(tableId);
  }
};

module.exports = {
  validateTableCapacity,
  checkTableAvailability,
  releaseTable,
  occupyTable,
  updateTableStatusByReservation,
};
