/**
 * Table Controller
 * Handles table CRUD operations and management
 */

const Table = require('../models/tableModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');
const { validateString, validatePositiveNumber } = require('../utils/validation');
const { TABLE_STATUS, HTTP_STATUS } = require('../utils/constants');

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
  const skip = (page - 1) * limit;
  const { search, status } = req.query;

  const query = {};

  if (search) {
    query.tableNumber = { $regex: search, $options: 'i' };
  }

  if (status) {
    query.status = status;
  }

  const total = await Table.countDocuments(query);
  const tables = await Table.find(query).sort({ tableNumber: 1 }).skip(skip).limit(limit);

  sendPaginated(res, tables, total, page, limit, 'Tables retrieved successfully');
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
 * Retrieves all tables with Available status
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAvailableTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ status: TABLE_STATUS.AVAILABLE }).sort({ tableNumber: 1 });

  sendSuccess(res, tables, 'Available tables retrieved successfully', HTTP_STATUS.OK);
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
