const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Runs after the validation rules of a route.
// If any rule failed, the request stops here with 400 Bad Request.
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  // Only send the field name and message.
  // The value is never sent back or logged (it could be a password).
  const errors = result.array().map((err) => {
    if (err.type === 'unknown_fields') {
      return { field: err.fields.map((f) => f.path).join(', '), message: err.msg };
    }
    return { field: err.path, message: err.msg };
  });

  const fieldNames = errors.map((e) => e.field).join(', ');
  logger.warn(`Validation failed: ${req.method} ${req.originalUrl} - ${fieldNames}`);

  res.status(400).json({
    status: false,
    message: 'Validation failed',
    errors,
  });
};

module.exports = validate;
