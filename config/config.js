// Loads the settings from environment variables.
// When running locally they come from the .env file.
// On Vercel they are set in the project settings.
require('dotenv').config({ quiet: true });

const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  apiRateLimit: Number(process.env.API_RATE_LIMIT) || 200,
};

// Stop the app early if a required secret is missing
if (!config.mongoUri || !config.jwtSecret) {
  throw new Error('MONGODB_URI and JWT_SECRET must be set (see .env.example)');
}

module.exports = config;
