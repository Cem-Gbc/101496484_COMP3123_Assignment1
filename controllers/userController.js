const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config/config');
const { createToken } = require('../services/tokenService');

// POST /api/v1/user/signup - register a new user
const signup = async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    throw new AppError(400, 'Username, email and password are required');
  }

  // Username and email must not belong to another user (409 Conflict)
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    const field = existingUser.username === username ? 'Username' : 'Email';
    logger.warn(`Signup failed: ${field.toLowerCase()} already exists (username: ${username})`);
    throw new AppError(409, `${field} already exists`);
  }

  // The password is hashed by the pre('save') hook in the User model
  const user = await User.create({ username, email, password });
  logger.info(`New user registered: ${user.username}`);

  res.status(201).json({
    status: true,
    message: 'User created successfully',
    user,
  });
};

// POST /api/v1/user/login - log in with (username or email) + password
const login = async (req, res) => {
  const { username, email, password } = req.body || {};

  if ((!username && !email) || !password) {
    throw new AppError(400, 'Username or email, and password are required');
  }

  // Find the user by email if it was sent, otherwise by username.
  // The password is hidden by default, so we ask for it with select('+password').
  const filter = email ? { email } : { username };
  const user = await User.findOne(filter).select('+password');

  // Same message for "user not found" and "wrong password",
  // so nobody can find out which usernames exist
  if (!user || !(await user.comparePassword(password))) {
    logger.warn(`Login failed for "${email || username}"`);
    throw new AppError(401, 'Invalid username/email or password');
  }

  const token = createToken(user);
  logger.info(`Login successful: ${user.username}`);

  res.status(200).json({
    status: true,
    message: 'Login successful',
    jwt_token: token,
    token_type: 'Bearer',
    expires_in: config.jwtExpiresIn,
    user,
  });
};

module.exports = { signup, login };
