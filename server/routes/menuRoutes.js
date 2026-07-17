const express = require('express');

const router = express.Router();

const upload = require('../middleware/uploadMiddleware');

const protect = require('../middleware/auth');

const {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuByCategory,
} = require('../controllers/menuController');

router.post('/', protect, upload.single('image'), createMenuItem);

router.get('/', getMenuItems);

router.get('/:id', getMenuItem);

router.get('/category/:category', getMenuByCategory);

router.patch('/:id', protect, upload.single('image'), updateMenuItem);

router.delete('/:id', protect, deleteMenuItem);

module.exports = router;
