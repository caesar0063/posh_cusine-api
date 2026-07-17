const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const validateEnv = require('./config/validateEnv');
const app = require('./app');
const connectDB = require('./config/db');

// Validate environment variables
validateEnv();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
