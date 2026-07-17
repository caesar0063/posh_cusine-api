const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth');

const {
  login,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
} = require('../controllers/authController');

router.post(
  '/login',

  login
);

router.patch(
  '/profile',

  protect,

  updateProfile
);

router.patch(
  '/password',

  protect,

  changePassword
);

router.get('/preferences', protect, getPreferences);

router.patch('/preferences', protect, updatePreferences);

module.exports = router;
