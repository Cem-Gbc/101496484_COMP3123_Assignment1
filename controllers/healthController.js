const mongoose = require('mongoose');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

// GET /health - shows that the API is running and if MongoDB is reachable
const getHealth = async (req, res) => {
  let database = 'connected';

  try {
    await connectDB();
    await mongoose.connection.db.admin().ping();
  } catch (err) {
    // The server is still running even when the database is down
    database = 'disconnected';
    logger.warn(`Health check: database is not reachable (${err.message})`);
  }

  res.status(200).json({
    status: true,
    message: 'COMP3123 Assignment 1 API is running',
    database,
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
