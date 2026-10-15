const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// The assignment requires this exact database name
const DB_NAME = 'comp3123_assignment1';

// We keep the connection promise so the connection is created only once.
// On Vercel one function instance handles many requests, so every request
// reuses the same connection instead of opening a new one.
let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Start connecting only if we are not already connecting
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.mongoUri, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 5000, // fail after 5 seconds if MongoDB is not reachable
      })
      .then(() => {
        logger.info(`Connected to MongoDB database "${DB_NAME}"`);
      })
      .catch((err) => {
        connectionPromise = null; // allow the next request to try again
        throw err;
      });
  }

  await connectionPromise;
};

module.exports = connectDB;
