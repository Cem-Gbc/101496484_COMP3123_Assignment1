const logger = require('../utils/logger');

// Logs one line for every request when the response is finished:
// method, path, status code, time taken, client IP and user.
// Request bodies and headers are NOT logged, so passwords and tokens never reach the logs.
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const user = req.user ? req.user.username : '-';
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms ip=${req.ip} user=${user}`;

    if (res.statusCode >= 500) {
      logger.error(line);
    } else if (res.statusCode >= 400) {
      logger.warn(line);
    } else {
      logger.info(line);
    }
  });

  next();
};

module.exports = requestLogger;
