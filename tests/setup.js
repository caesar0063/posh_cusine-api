/**
 * Jest Setup File
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/posh-cuisine-test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long!';
process.env.PORT = 5001;
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';

// Suppress console output during tests
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  global.console.info = jest.fn();
}
