const { rateLimit } = require('express-rate-limit');
const config = require('../config/config');
const logger = require('../utils/logger');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Runs when a client goes over a limit: log it and send 429 Too Many Requests
const sendLimitReached = (req, res, next, options) => {
  const minutesLeft = Math.ceil((req.rateLimit.resetTime - Date.now()) / 60000);
  logger.warn(`Rate limit reached: ${req.method} ${req.originalUrl} ip=${req.ip}`);

  res.status(options.statusCode).json({
    status: false,
    message: `Too many requests. Please try again in ${minutesLeft} minute(s).`,
  });
};

// Login and signup: a strict limit that slows down password guessing
// and mass account creation (default: 20 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: config.authRateLimit,
  standardHeaders: 'draft-8', // send RateLimit headers so the client can see its limit
  legacyHeaders: false,
  handler: sendLimitReached,
});

// Every /api request: a higher general limit
// (default: 200 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: config.apiRateLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: sendLimitReached,
});

module.exports = { authLimiter, apiLimiter };
