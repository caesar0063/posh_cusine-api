/**
 * Environment variable validation utility
 * Ensures all required variables are set before application starts
 */

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'PORT'];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please copy .env.example to .env and fill in the required values.');
    process.exit(1);
  }

  // Validate JWT_SECRET length (minimum 32 characters)
  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long for security.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
};

module.exports = validateEnv;
