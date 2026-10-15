// Starts the API locally: connect to MongoDB first, then listen on PORT
const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

connectDB()
  .then(() => {
    app.listen(config.port, (err) => {
      if (err) {
        logger.error(`Server could not start: ${err.message}`);
        return process.exit(1);
      }
      logger.info(`Server started on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
