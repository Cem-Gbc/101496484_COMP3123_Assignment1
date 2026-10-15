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

  // The request body is not valid JSON
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    // Full details go to the log file, the client only sees a general message
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
    message = 'Internal server error';
  }

  res.status(statusCode).json({ status: false, message });
};

module.exports = { notFound, errorHandler };
