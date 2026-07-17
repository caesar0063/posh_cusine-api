/**
 * Request Logging Middleware
 * Logs all incoming requests with method, path, and response time
 */

const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info({
    message: `${req.method} ${req.originalUrl}`,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

module.exports = requestLogger;
