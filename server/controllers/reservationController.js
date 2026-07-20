/**
 * Reservation Controller
 * Handles reservation CRUD operations and business logic
 */

const Reservation = require('../models/reservationModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');
const { RESERVATION_STATUS, HTTP_STATUS } = require('../utils/constants');
const sendReservationEmail = require('../utils/sendEmail');

const {
  validateTableCapacity,
  checkTableAvailability,
  releaseTable,
  updateTableStatusByReservation,
} = require('../services/tableService');

/**
 * Create Reservation - POST /api/v1/reservations
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.create(req.body);

  try {
    await sendReservationEmail(reservation);
  } catch (emailError) {
    console.error('Email notification failed:', emailError.message);
  }

  sendSuccess(res, reservation, 'Reservation created successfully', HTTP_STATUS.CREATED);
});

/**
 * Get All Reservations - GET /api/v1/reservations
 * Supports pagination, filtering, and sorting
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, status, sort } = req.query;

  const query = {};

  // Search by name or phone
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Sorting logic
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'guestsHigh') {
    sortOption = { guests: -1 };
  } else if (sort === 'guestsLow') {
    sortOption = { guests: 1 };
  }

  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .populate('assignedTable')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  sendPaginated(res, reservations, total, page, limit, 'Reservations retrieved successfully');
});

/**
 * Get Single Reservation - GET /api/v1/reservations/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate('assignedTable');

  if (!reservation) {
    throw new AppError('Reservation not found.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(res, reservation, 'Reservation retrieved successfully', HTTP_STATUS.OK);
});


/**
 * Update Reservation - PATCH /api/v1/reservations/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateReservation = asyncHandler(async (req, res) => {
  const existingReservation = await Reservation.findById(req.params.id);

  if (!existingReservation) {
    throw new AppError(
      'Reservation not found.',
      HTTP_STATUS.NOT_FOUND
    );
  }

  const currentStatus = existingReservation.status;
  const nextStatus = req.body.status || currentStatus;

  const allowedTransitions = {
    [RESERVATION_STATUS.PENDING]: [
      RESERVATION_STATUS.CONFIRMED,
      RESERVATION_STATUS.CANCELLED,
    ],

    [RESERVATION_STATUS.CONFIRMED]: [
      RESERVATION_STATUS.SEATED,
      RESERVATION_STATUS.CANCELLED,
    ],

    [RESERVATION_STATUS.SEATED]: [
      RESERVATION_STATUS.COMPLETED,
    ],

    [RESERVATION_STATUS.COMPLETED]: [],

    [RESERVATION_STATUS.CANCELLED]: [],
  };

  // =========================
  // VALIDATE STATUS TRANSITION
  // =========================

  if (
    nextStatus !== currentStatus &&
    !allowedTransitions[currentStatus].includes(nextStatus)
  ) {
    throw new AppError(
      `Cannot change reservation from ${currentStatus} to ${nextStatus}.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const hasTableUpdate = Object.prototype.hasOwnProperty.call(
    req.body,
    'assignedTable'
  );

  const proposedTableId = hasTableUpdate
    ? req.body.assignedTable
    : existingReservation.assignedTable?.toString();

  // =========================
  // TABLE ASSIGNMENT RULES
  // =========================

  if (hasTableUpdate) {
    if (
      currentStatus !== RESERVATION_STATUS.PENDING &&
      currentStatus !== RESERVATION_STATUS.CONFIRMED
    ) {
      throw new AppError(
        'Table assignment can only be changed before the customer is seated.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (proposedTableId) {
      const selectedTable = await validateTableCapacity(
        proposedTableId,
        existingReservation.guests
      );

      const conflictingReservation =
        await checkTableAvailability(
          proposedTableId,
          existingReservation.reservationDate,
          existingReservation.reservationTime,
          req.params.id
        );

      if (conflictingReservation) {
        throw new AppError(
          `Table ${selectedTable.tableNumber} is already reserved for this time.`,
          HTTP_STATUS.CONFLICT
        );
      }
    }
  }

  // =========================
  // CONFIRMATION RULE
  // =========================

  if (
    nextStatus === RESERVATION_STATUS.CONFIRMED &&
    !proposedTableId
  ) {
    throw new AppError(
      'A table must be assigned before confirming the reservation.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // =========================
  // SEATED RULE
  // =========================

  if (
    nextStatus === RESERVATION_STATUS.SEATED &&
    !proposedTableId
  ) {
    throw new AppError(
      'A table must be assigned before seating the customer.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // =========================
  // UPDATE RESERVATION
  // =========================

  const previousTableId =
    existingReservation.assignedTable?.toString();

  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate('assignedTable');

  if (!reservation) {
    throw new AppError(
      'Reservation update failed.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  const newTableId =
    reservation.assignedTable?._id?.toString();

  // =========================
  // RELEASE OLD TABLE
  // =========================

  if (
    previousTableId &&
    previousTableId !== newTableId
  ) {
    await releaseTable(previousTableId);
  }

  // =========================
  // UPDATE TABLE STATUS
  // =========================

  await updateTableStatusByReservation(
    newTableId,
    reservation.status
  );

  sendSuccess(
    res,
    reservation,
    'Reservation updated successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Delete Reservation - DELETE /api/v1/reservations/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError('Reservation not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Release assigned table
  if (reservation.assignedTable) {
    await releaseTable(reservation.assignedTable);
  }

  await Reservation.findByIdAndDelete(req.params.id);

  sendSuccess(res, {}, 'Reservation deleted successfully', HTTP_STATUS.OK);
});

/**
 * Get Reservation Statistics - GET /api/v1/reservations/stats/all
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const reservationStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const stats = await Promise.all([
    Reservation.countDocuments(),
    Reservation.countDocuments({ reservationDate: { $gte: startOfToday } }),
    Reservation.countDocuments({ reservationDate: { $gte: startOfWeek } }),
    Reservation.countDocuments({ reservationDate: { $gte: startOfMonth } }),
    Reservation.countDocuments({ status: RESERVATION_STATUS.PENDING }),
    Reservation.countDocuments({ status: RESERVATION_STATUS.CONFIRMED }),
    Reservation.countDocuments({ status: RESERVATION_STATUS.SEATED }),
    Reservation.countDocuments({ status: RESERVATION_STATUS.COMPLETED }),
    Reservation.countDocuments({ status: RESERVATION_STATUS.CANCELLED }),
  ]);

  const [
    total,
    todayReservations,
    weekReservations,
    monthReservations,
    pending,
    confirmed,
    seated,
    completed,
    cancelled,
  ] = stats;

  sendSuccess(
    res,
    {
      total,
      todayReservations,
      weekReservations,
      monthReservations,
      pending,
      confirmed,
      seated,
      completed,
      cancelled,
    },
    'Statistics retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Get Today's Reservation Schedule - GET /api/v1/reservations/schedule/today
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const todaySchedule = asyncHandler(async (req, res) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const reservations = await Reservation.find({
    reservationDate: {
      $gte: start,
      $lt: end,
    },
  })
    .populate('assignedTable')
    .sort({ reservationTime: 1 });

  sendSuccess(res, reservations, 'Today schedule retrieved successfully', HTTP_STATUS.OK);
});

module.exports = {
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
  reservationStats,
  todaySchedule,
};
