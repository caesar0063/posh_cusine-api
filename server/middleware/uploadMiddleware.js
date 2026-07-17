const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===============================
// Upload Directory
// ===============================

const uploadPath = path.join(__dirname, '../uploads/menu');

// Create folder automatically

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// ===============================
// Storage Configuration
// ===============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ===============================
// File Filter
// ===============================

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WEBP images are allowed'));
  }
};

// ===============================
// Multer Configuration
// ===============================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ===============================
// Export
// ===============================

module.exports = upload;
