const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { verifyToken } = require('../services/tokenService');

// Protects a route. The client must send this header:
//   Authorization: Bearer <jwt>
// If the token is valid, the logged-in user is saved in req.user.
const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  // 1. The header must exist and start with "Bearer "
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn(`Auth failed (no token): ${req.method} ${req.originalUrl}`);
    throw new AppError(401, 'Access denied. No token provided');
  }

  const token = header.split(' ')[1];

  // 2. Check the token's signature and expiry date
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn(`Auth failed (expired token): ${req.method} ${req.originalUrl}`);
      throw new AppError(401, 'Token has expired. Please log in again');
    }
    logger.warn(`Auth failed (invalid token): ${req.method} ${req.originalUrl}`);
    throw new AppError(401, 'Invalid token');
  }

  // 3. The user inside the token must still exist
  const user = await User.findById(payload.id);
  if (!user) {
    logger.warn(`Auth failed (user no longer exists): ${req.method} ${req.originalUrl}`);
    throw new AppError(401, 'Invalid token');
  }

  // Controllers use req.user to know who is logged in.
  // Employee ownership always comes from here, never from the request body.
  req.user = { id: user._id.toString(), username: user.username };
  next();
};

module.exports = auth;
