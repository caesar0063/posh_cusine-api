const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth');
const validateReservation = require('../middleware/reservationValidation');

const {
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
  reservationStats,
  todaySchedule,
} = require('../controllers/reservationController');

// Specific routes first
router.get('/stats/all', protect, reservationStats);

router.get('/schedule/today', protect, todaySchedule);

// General routes
router.post('/', validateReservation, createReservation);

router.get('/', protect, getReservations);

// Parameterized routes last
router.get('/:id', protect, getReservation);

router.patch('/:id', protect, updateReservation);

router.delete('/:id', protect, deleteReservation);

module.exports = router;
