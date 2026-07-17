/**
 * Reservation Validation Middleware
 * Validates reservation request data
 */

const { VALIDATION_RULES } = require('../utils/constants');
const AppError = require('../utils/AppError');

const validateReservation = (req, res, next) => {
  const { fullName, phone, guests, reservationDate, reservationTime } = req.body;

  // Required fields
  if (!fullName?.trim() || !phone?.trim() || !reservationDate || !reservationTime || !guests) {
    return next(new AppError('Please fill in all required fields.', 400));
  }

  // Phone validation
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return next(new AppError('Enter a valid phone number.', 400));
  }

  // Guest validation
  if (guests < VALIDATION_RULES.MIN_GUESTS || guests > VALIDATION_RULES.MAX_GUESTS) {
    return next(
      new AppError(
        `Guests must be between ${VALIDATION_RULES.MIN_GUESTS} and ${VALIDATION_RULES.MAX_GUESTS}.`,
        400
      )
    );
  }

  next();
};

module.exports = validateReservation;
