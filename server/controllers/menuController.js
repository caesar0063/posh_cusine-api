/**
 * Menu Controller
 * Handles menu item CRUD operations
 */

const Menu = require('../models/menuModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');
const { validateString, validatePositiveNumber } = require('../utils/validation');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Create Menu Item - POST /api/v1/menu
 * @param {Object} req - Express request with file upload
 * @param {Object} res - Express response
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  validateString(name, 'Menu item name');
  validateString(description, 'Description');
  validatePositiveNumber(price, 'Price');
  validateString(category, 'Category');

  if (req.file) {
    req.body.image = req.file.filename;
  }

  const menuItem = await Menu.create(req.body);

  sendSuccess(res, menuItem, 'Menu item created successfully', HTTP_STATUS.CREATED);
});

/**
 * Get All Menu Items - GET /api/v1/menu
 * Supports pagination, search, and category filtering
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, category } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  const total = await Menu.countDocuments(query);
  const menuItems = await Menu.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

  sendPaginated(res, menuItems, total, page, limit, 'Menu items retrieved successfully');
});

/**
 * Get Single Menu Item - GET /api/v1/menu/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (!menuItem) {
    throw new AppError('Menu item not found.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(res, menuItem, 'Menu item retrieved successfully', HTTP_STATUS.OK);
});

/**
 * Update Menu Item - PATCH /api/v1/menu/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (!menuItem) {
    throw new AppError('Menu item not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Validate price if being updated
  if (req.body.price) {
    validatePositiveNumber(req.body.price, 'Price');
  }

  // Update image if new file uploaded
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const updatedItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, updatedItem, 'Menu item updated successfully', HTTP_STATUS.OK);
});

/**
 * Delete Menu Item - DELETE /api/v1/menu/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (!menuItem) {
    throw new AppError('Menu item not found.', HTTP_STATUS.NOT_FOUND);
  }

  await Menu.findByIdAndDelete(req.params.id);

  sendSuccess(res, {}, 'Menu item deleted successfully', HTTP_STATUS.OK);
});

/**
 * Get Menu by Category - GET /api/v1/menu/category/:category
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getMenuByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const menuItems = await Menu.find({ category }).sort({ createdAt: -1 });

  sendSuccess(res, menuItems, 'Menu items retrieved successfully', HTTP_STATUS.OK);
});

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuByCategory,
};
