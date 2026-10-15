const { body, param, query, checkExact } = require('express-validator');

// checkExact() rejects fields we do not expect, for example "user".
// This is how a client is stopped from choosing the owner of an employee.
const exactBody = { locations: ['body'], message: 'This field is not allowed' };

// Letters (any language), spaces, apostrophes, dots and hyphens, e.g. "O'Brien", "Mary-Jane", "Gözde"
const NAME_PATTERN = /^[\p{L} .'-]+$/u;

// Rules for the employee fields.
// POST (create): every field is required.
// PUT (update): every field is optional, but a field that is sent must be valid.
const employeeFieldRules = (isUpdate) => {
  // Start the rule for one field: optional on update, required on create
  const field = (name, label) => {
    if (isUpdate) {
      return body(name).optional();
    }
    return body(name).notEmpty().withMessage(`${label} is required`).bail();
  };

  return [
    field('first_name', 'First name')
      .isString().withMessage('First name must be a string').bail()
      .trim()
      .isLength({ min: 1, max: 50 }).withMessage('First name must be 1 to 50 characters')
      .matches(NAME_PATTERN).withMessage('First name can only contain letters, spaces, apostrophes, dots and hyphens'),

    field('last_name', 'Last name')
      .isString().withMessage('Last name must be a string').bail()
      .trim()
      .isLength({ min: 1, max: 50 }).withMessage('Last name must be 1 to 50 characters')
      .matches(NAME_PATTERN).withMessage('Last name can only contain letters, spaces, apostrophes, dots and hyphens'),

    field('email', 'Email')
      .isString().withMessage('Email must be a string').bail()
      .trim()
      .toLowerCase()
      .isLength({ max: 100 }).withMessage('Email must be at most 100 characters')
      .isEmail().withMessage('Email must be a valid email address'),

    field('position', 'Position')
      .isString().withMessage('Position must be a string').bail()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Position must be 2 to 50 characters'),

    // not().isArray(): express-validator would otherwise check each item of an array
    field('salary', 'Salary')
      .not().isArray().withMessage('Salary must be a number').bail()
      .isFloat({ gt: 0, max: 10000000 }).withMessage('Salary must be a positive number (maximum 10,000,000)')
      .toFloat(),

    field('date_of_joining', 'Date of joining')
      .not().isArray().withMessage('Date of joining must be a single date').bail()
      .isISO8601({ strict: true }).withMessage('Date of joining must be a valid date (YYYY-MM-DD)')
      .toDate(),

    field('department', 'Department')
      .isString().withMessage('Department must be a string').bail()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Department must be 2 to 50 characters'),
  ];
};

// :eid in the URL must be a valid MongoDB ObjectId
const eidInUrl = param('eid').isMongoId().withMessage('Invalid employee id');

// ?eid= in the query string (DELETE)
const eidInQuery = query('eid')
  .notEmpty().withMessage('Employee id (eid) is required in the query string').bail()
  .isString().withMessage('Send only one employee id').bail()
  .isMongoId().withMessage('Invalid employee id');

// POST /api/v1/emp/employees
const createEmployeeRules = checkExact(employeeFieldRules(false), exactBody);

// GET /api/v1/emp/employees/:eid
const getEmployeeRules = [eidInUrl];

// PUT /api/v1/emp/employees/:eid
const updateEmployeeRules = checkExact([eidInUrl, ...employeeFieldRules(true)], exactBody);

// DELETE /api/v1/emp/employees?eid=xxx
const deleteEmployeeRules = [eidInQuery];

module.exports = {
  createEmployeeRules,
  getEmployeeRules,
  updateEmployeeRules,
  deleteEmployeeRules,
};
