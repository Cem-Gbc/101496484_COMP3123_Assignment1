const logger = require('../utils/logger');

// 404 - no route matched the request
const notFound = (req, res) => {
  res.status(404).json({
    status: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error handler. Every error in the app ends up here
// and is sent back as JSON with the right status code.
// (Express knows this is an error handler because it has 4 parameters.)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.type === 'entity.parse.failed') {
    // The request body is not valid JSON
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    // The request body is bigger than the 10kb limit
    statusCode = 413;
    message = 'Request body is too large';
  } else if (err.code === 11000) {
    // MongoDB duplicate key: a unique field already has this value
    statusCode = 409;
    message = 'A record with the same unique value already exists';
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation failed
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => (e.name === 'CastError' ? `Invalid value for ${e.path}` : e.message))
      .join(', ');
  } else if (err.name === 'CastError') {
    // A value has the wrong type, for example an invalid ObjectId
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  if (statusCode >= 500) {
    // Full details go to the log file, the client only sees a general message
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
    message = 'Internal server error';
  }

  res.status(statusCode).json({ status: false, message });
};

module.exports = { notFound, errorHandler };
