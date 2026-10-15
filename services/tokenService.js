const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Create a signed JWT for a user.
// The token stores the user's id and username and expires after JWT_EXPIRES_IN.
const createToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' }
  );
};

// Check the token's signature and expiry date.
// Returns the token data, or throws an error if the token is not valid.
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
};

module.exports = { createToken, verifyToken };
