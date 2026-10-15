// An error that has an HTTP status code.
// Example: throw new AppError(404, 'Employee not found');
// The central error handler sends it to the client as JSON.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
