/**
 * Response Formatter Utility
 * Standardizes all API responses for consistency
 */

const { HTTP_STATUS } = require('./constants');

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
const sendPaginated = (res, data, total, page, limit, message = 'Success') => {
  const pages = Math.ceil(total / limit);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    count: data.length,
    total,
    page,
    pages,
    data,
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
