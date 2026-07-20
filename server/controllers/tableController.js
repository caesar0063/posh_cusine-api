/**
 * Table Controller
 * Handles table CRUD operations and management
 */

const Table = require('../models/tableModel');
const asyncHandler = require('../utils/asyncHandler');
const Reservation = require('../models/reservationModel');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');
const { validateString, validatePositiveNumber } = require('../utils/validation');
const {
  TABLE_STATUS,
  RESERVATION_STATUS,
  HTTP_STATUS,
} = require('../utils/constants');

/**
 * Create Table - POST /api/v1/tables
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity } = req.body;

  validateString(tableNumber, 'Table number');
  validatePositiveNumber(capacity, 'Capacity');

  const existingTable = await Table.findOne({ tableNumber });

  if (existingTable) {
    throw new AppError('Table number already exists.', HTTP_STATUS.CONFLICT);
  }

  const table = await Table.create(req.body);

  sendSuccess(res, table, 'Table created successfully', HTTP_STATUS.CREATED);
});

/**
 * Get All Tables - GET /api/v1/tables
 * Supports pagination, search, and status filtering
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */

const getTables = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, status } = req.query;

  const tableQuery = {};

  if (search) {
    tableQuery.tableNumber = {
      $regex: search,
      $options: 'i',
    };
  }

  const tables = await Table.find(tableQuery)
    .sort({ tableNumber: 1 })
    .lean();

  const tableIds = tables.map((table) => table._id);

  const reservations = await Reservation.find({
    assignedTable: {
      $in: tableIds,
    },

    status: {
      $in: [
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.CONFIRMED,
      ],
    },
  })
    .sort({
      reservationDate: 1,
      reservationTime: 1,
    })
    .lean();

  const reservationMap = new Map();

  reservations.forEach((reservation) => {
    const tableId = reservation.assignedTable?.toString();

    if (!tableId) return;

    if (!reservationMap.has(tableId)) {
      reservationMap.set(tableId, []);
    }

    reservationMap.get(tableId).push({
      id: reservation._id,
      customer: reservation.fullName,
      guests: reservation.guests,
      date: reservation.reservationDate,
      time: reservation.reservationTime,
    });
  });

  const processedTables = tables.map((table) => {
    const tableReservations =
      reservationMap.get(table._id.toString()) || [];

    let displayStatus = table.status;

    if (
      table.status !== TABLE_STATUS.MAINTENANCE &&
      table.status !== TABLE_STATUS.OCCUPIED &&
      tableReservations.length > 0
    ) {
      displayStatus = 'Reserved';
    }

    return {
      ...table,

      displayStatus,

      reservations: tableReservations,
    };
  });

  const filteredTables = status
    ? processedTables.filter(
        (table) => table.displayStatus === status
      )
    : processedTables;

  const total = filteredTables.length;

  const skip = (page - 1) * limit;

  const paginatedTables = filteredTables.slice(
    skip,
    skip + limit
  );

  sendPaginated(
    res,
    paginatedTables,
    total,
    page,
    limit,
    'Tables retrieved successfully'
  );
});


/**
 * Get Single Table - GET /api/v1/tables/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    throw new AppError('Table not found.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(res, table, 'Table retrieved successfully', HTTP_STATUS.OK);
});

/**
 * Update Table - PATCH /api/v1/tables/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    throw new AppError('Table not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Validate capacity if being updated
  if (req.body.capacity) {
    validatePositiveNumber(req.body.capacity, 'Capacity');
  }

  // Check for duplicate table number if being updated
  if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
    const existingTable = await Table.findOne({ tableNumber: req.body.tableNumber });

    if (existingTable) {
      throw new AppError('Table number already exists.', HTTP_STATUS.CONFLICT);
    }
  }

  const updatedTable = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, updatedTable, 'Table updated successfully', HTTP_STATUS.OK);
});

/**
 * Delete Table - DELETE /api/v1/tables/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    throw new AppError('Table not found.', HTTP_STATUS.NOT_FOUND);
  }

  await Table.findByIdAndDelete(req.params.id);

  sendSuccess(res, {}, 'Table deleted successfully', HTTP_STATUS.OK);
});


/**
 * Get Available Tables - GET /api/v1/tables/status/available
 * Returns tables available for a specific reservation time
 */
const getAvailableTables = asyncHandler(async (req, res) => {
  const {
    date,
    time,
    reservationId,
  } = req.query;

  const tables = await Table.find({
    status: {
      $ne: TABLE_STATUS.MAINTENANCE,
    },
  }).sort({
    tableNumber: 1,
  });

  if (!date || !time) {
    sendSuccess(
      res,
      tables,
      'Available tables retrieved successfully',
      HTTP_STATUS.OK
    );

    return;
  }

  const conflicts = await Reservation.find({
    _id: {
      $ne: reservationId,
    },

    assignedTable: {
      $in: tables.map((table) => table._id),
    },

    reservationDate: date,

    reservationTime: time,

    status: {
      $in: [
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.CONFIRMED,
        RESERVATION_STATUS.SEATED,
      ],
    },
  }).select('assignedTable');

  const conflictingTableIds = new Set(
    conflicts.map((reservation) =>
      reservation.assignedTable.toString()
    )
  );

  const availableTables = tables.filter(
    (table) =>
      !conflictingTableIds.has(table._id.toString())
  );

  sendSuccess(
    res,
    availableTables,
    'Available tables retrieved successfully',
    HTTP_STATUS.OK
  );
});


/**
 * Get Tables by Capacity - GET /api/v1/tables/capacity/:capacity
 * Retrieves tables that can accommodate specified guest count
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getTablesByCapacity = asyncHandler(async (req, res) => {
  const capacity = validatePositiveNumber(req.params.capacity, 'Capacity');

  const tables = await Table.find({
    capacity: { $gte: capacity },
    status: TABLE_STATUS.AVAILABLE,
  }).sort({
    capacity: 1,
  });

  if (tables.length === 0) {
    throw new AppError('No tables available for requested capacity.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(res, tables, 'Tables retrieved successfully', HTTP_STATUS.OK);
});

module.exports = {
  createTable,
  getTables,
  getTable,
  updateTable,
  deleteTable,
  getAvailableTables,
  getTablesByCapacity,
};
