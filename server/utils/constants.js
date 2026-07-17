/**
 * Application-wide constants
 */

// Reservation statuses
const RESERVATION_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Table statuses
const TABLE_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Maintenance',
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Validation rules
const VALIDATION_RULES = {
  MIN_GUESTS: 1,
  MAX_GUESTS: 20,
  MIN_PASSWORD_LENGTH: 6,
  MIN_JWT_SECRET_LENGTH: 32,
  PHONE_REGEX: /^\+?[0-9]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// API Messages
const API_MESSAGES = {
  SUCCESS: 'Success',
  ERROR: 'An error occurred',
  CREATED_SUCCESSFULLY: '{resource} created successfully',
  UPDATED_SUCCESSFULLY: '{resource} updated successfully',
  DELETED_SUCCESSFULLY: '{resource} deleted successfully',
  NOT_FOUND: '{resource} not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  UNAUTHORIZED: 'Not authorized. No token.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  INVALID_TOKEN: 'Invalid authentication token',
};

module.exports = {
  RESERVATION_STATUS,
  TABLE_STATUS,
  HTTP_STATUS,
  VALIDATION_RULES,
  API_MESSAGES,
};
