const express = require('express');
const cors = require('cors');
const path = require('path');

const reservationRoutes = require('./routes/reservationRoutes');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5500",
    "YOUR_FRONTEND_URL"
  ],
  credentials: true
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tables', tableRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Posh Cuisine Booking API',
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
