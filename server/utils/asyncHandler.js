/**
 * AsyncHandler wrapper for Express route handlers
 * Automatically catches errors and passes them to error middleware
 * Eliminates need for try-catch blocks in every controller
 */

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
