/**
 * Authentication Middleware
 * Verifies JWT token and attaches admin to request
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../utils/constants');

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. No token.', HTTP_STATUS.UNAUTHORIZED));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      return next(new AppError('Admin account no longer exists.', HTTP_STATUS.UNAUTHORIZED));
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please login again.', HTTP_STATUS.UNAUTHORIZED));
    }

    return next(new AppError('Invalid authentication token.', HTTP_STATUS.UNAUTHORIZED));
  }
};

module.exports = protect;
