const express = require('express');

const router = express.Router();

const protect = require('../middleware/auth');

const {
  createTable,
  getTables,
  getTable,
  updateTable,
  deleteTable,
  getAvailableTables,
  getTablesByCapacity,
} = require('../controllers/tableController');

// Specific routes first
router.get('/status/available', protect, getAvailableTables);

router.get('/capacity/:capacity', protect, getTablesByCapacity);

// General routes
router.post('/', protect, createTable);

router.get('/', protect, getTables);

// Parameterized routes last
router.get('/:id', protect, getTable);

router.patch('/:id', protect, updateTable);

router.delete('/:id', protect, deleteTable);

module.exports = router;
