/**
 * Input Validation Utilities
 * Centralized validation functions for common patterns
 */

const AppError = require('./AppError');
const { VALIDATION_RULES, HTTP_STATUS } = require('./constants');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {AppError} If email is invalid
 */
const validateEmail = (email) => {
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    throw new AppError('Invalid email format.', HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @throws {AppError} If phone is invalid
 */
const validatePhone = (phone) => {
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    throw new AppError('Enter a valid phone number.', HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @throws {AppError} If password is too weak
 */
const validatePassword = (password) => {
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
};

/**
 * Validate guest count
 * @param {number} guests - Number of guests
 * @throws {AppError} If guest count is invalid
 */
const validateGuestCount = (guests) => {
  const guestNum = parseInt(guests);

  if (
    Number.isNaN(guestNum) ||
    guestNum < VALIDATION_RULES.MIN_GUESTS ||
    guestNum > VALIDATION_RULES.MAX_GUESTS
  ) {
    throw new AppError(
      `Guests must be between ${VALIDATION_RULES.MIN_GUESTS} and ${VALIDATION_RULES.MAX_GUESTS}.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return guestNum;
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array<string>} fields - Required field names
 * @throws {AppError} If any required field is missing
 */
const validateRequiredFields = (data, fields) => {
  const missing = fields.filter(
    (field) => !data[field] || (typeof data[field] === 'string' && !data[field].trim())
  );

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}.`, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Validate string field (non-empty after trim)
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @throws {AppError} If value is empty
 * @returns {string} Trimmed value
 */
const validateString = (value, fieldName) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    throw new AppError(`${fieldName} is required.`, HTTP_STATUS.BAD_REQUEST);
  }

  return trimmed;
};

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @throws {AppError} If value is not a positive number
 * @returns {number} The value
 */
const validatePositiveNumber = (value, fieldName) => {
  const num = Number(value);

  if (Number.isNaN(num) || num <= 0) {
    throw new AppError(`${fieldName} must be a positive number.`, HTTP_STATUS.BAD_REQUEST);
  }

  return num;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateGuestCount,
  validateRequiredFields,
  validateString,
  validatePositiveNumber,
};
