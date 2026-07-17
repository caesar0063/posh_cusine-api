/**
 * Custom Application Error Class
 * Provides structured error handling with status codes and messages
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
