const path = require('path');
const winston = require('winston');

// Each log line looks like: 2026-10-15T21:30:00.000Z [INFO] message
const lineFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

const transports = [new winston.transports.Console()];

// Save logs to files in the logs folder when running locally.
// Vercel does not allow writing files, so there we only log to the console
// (Vercel keeps console output in the project's Logs page).
if (!process.env.VERCEL) {
  const logsDir = path.join(__dirname, '..', 'logs');

  transports.push(
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5 * 1024 * 1024, // start a new file after 5 MB
      maxFiles: 3,
    }),
    // Only errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), lineFormat),
  transports,
});

module.exports = logger;
