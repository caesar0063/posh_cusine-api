/**
 * Authentication Controller
 * Handles admin login, profile management, and preferences
 */

const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Login - POST /api/v1/auth/login
 * Authenticate admin with email and password
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', HTTP_STATUS.BAD_REQUEST);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const admin = await Admin.findOne({ email: normalizedEmail });

  if (!admin) {
    throw new AppError('Invalid credentials.', HTTP_STATUS.UNAUTHORIZED);
  }

  const match = await bcrypt.compare(password, admin.password);

  if (!match) {
    throw new AppError('Invalid credentials.', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  sendSuccess(
    res,
    {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    },
    'Login successful',
    HTTP_STATUS.OK
  );
});

/**
 * Update Profile - PATCH /api/v1/auth/profile
 * Update admin name
 * @param {Object} req - Express request with admin attached
 * @param {Object} res - Express response
 */
const updateProfile = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    throw new AppError('Name is required.', HTTP_STATUS.BAD_REQUEST);
  }

  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    { name },
    { new: true, runValidators: true }
  ).select('-password');

  if (!admin) {
    throw new AppError('Admin not found.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(res, admin, 'Profile updated successfully', HTTP_STATUS.OK);
});

/**
 * Change Password - PATCH /api/v1/auth/password
 * Update admin password
 * @param {Object} req - Express request with admin attached
 * @param {Object} res - Express response
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('All password fields are required.', HTTP_STATUS.BAD_REQUEST);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters.', HTTP_STATUS.BAD_REQUEST);
  }

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    throw new AppError('Admin not found.', HTTP_STATUS.NOT_FOUND);
  }

  const passwordMatch = await bcrypt.compare(currentPassword, admin.password);

  if (!passwordMatch) {
    throw new AppError('Current password is incorrect.', HTTP_STATUS.BAD_REQUEST);
  }

  const samePassword = await bcrypt.compare(newPassword, admin.password);

  if (samePassword) {
    throw new AppError(
      'New password must be different from current password.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  sendSuccess(res, {}, 'Password updated successfully', HTTP_STATUS.OK);
});

/**
 * Get Preferences - GET /api/v1/auth/preferences
 * Retrieve admin notification preferences
 * @param {Object} req - Express request with admin attached
 * @param {Object} res - Express response
 */
const getPreferences = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('emailNotifications reservationAlerts');

  if (!admin) {
    throw new AppError('Admin not found.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(
    res,
    {
      emailNotifications: admin.emailNotifications,
      reservationAlerts: admin.reservationAlerts,
    },
    'Preferences retrieved successfully',
    HTTP_STATUS.OK
  );
});

/**
 * Update Preferences - PATCH /api/v1/auth/preferences
 * Update admin notification preferences
 * @param {Object} req - Express request with admin attached
 * @param {Object} res - Express response
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const { emailNotifications, reservationAlerts } = req.body;

  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      emailNotifications,
      reservationAlerts,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('emailNotifications reservationAlerts');

  if (!admin) {
    throw new AppError('Admin not found.', HTTP_STATUS.NOT_FOUND);
  }

  sendSuccess(res, admin, 'Preferences updated successfully', HTTP_STATUS.OK);
});

module.exports = {
  login,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
};
