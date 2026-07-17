/**
 * Global Error Handler Middleware
 * Catches and formats all application errors with structured logging
 */

const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  // Log error with structured data
  logger.error({
    message,
    statusCode,
    stack: err.stack,
    request: {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    },
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
