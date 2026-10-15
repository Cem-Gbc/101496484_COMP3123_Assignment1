const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { findOwnedEmployee, checkEmailNotUsed } = require('../services/employeeService');

// The only fields a client can set.
// "user" is not in this list on purpose: the owner always comes from the JWT.
const EMPLOYEE_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'position',
  'salary',
  'date_of_joining',
  'department',
];

// Copy only the allowed employee fields from the request body
const pickEmployeeFields = (body = {}) => {
  const data = {};
  for (const field of EMPLOYEE_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
};

// GET /api/v1/emp/employees - all employees of the logged-in user
const getEmployees = async (req, res) => {
  // Filtering by user means other users' employees are never returned
  const employees = await Employee.find({ user: req.user.id }).sort({ created_at: 1 });

  res.status(200).json({
    status: true,
    count: employees.length,
    employees,
  });
};

// POST /api/v1/emp/employees - create an employee for the logged-in user
const createEmployee = async (req, res) => {
  const data = pickEmployeeFields(req.body);

  await checkEmailNotUsed(data.email, req.user.id);

  // The owner is the logged-in user from the JWT
  const employee = await Employee.create({ ...data, user: req.user.id });
  logger.info(`Employee ${employee._id} created by ${req.user.username}`);

  res.status(201).json({
    status: true,
    message: 'Employee created successfully',
    employee,
  });
};

// GET /api/v1/emp/employees/:eid - one employee of the logged-in user
const getEmployeeById = async (req, res) => {
  const employee = await findOwnedEmployee(req.params.eid, req.user);

  res.status(200).json({
    status: true,
    employee,
  });
};

// PUT /api/v1/emp/employees/:eid - update an employee of the logged-in user
const updateEmployee = async (req, res) => {
  const updates = pickEmployeeFields(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, 'Send at least one employee field to update');
  }

  // 404 if it does not exist, 403 if it belongs to another user
  await findOwnedEmployee(req.params.eid, req.user);

  if (updates.email) {
    await checkEmailNotUsed(updates.email, req.user.id, req.params.eid);
  }

  // The filter also has the user id, so only the owner's employee can be changed
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.eid, user: req.user.id },
    updates,
    { returnDocument: 'after', runValidators: true }
  );

  if (!employee) {
    throw new AppError(404, 'Employee not found');
  }

  logger.info(`Employee ${employee._id} updated by ${req.user.username}`);

  res.status(200).json({
    status: true,
    message: 'Employee updated successfully',
    employee,
  });
};

// DELETE /api/v1/emp/employees?eid=xxx - delete an employee of the logged-in user
const deleteEmployee = async (req, res) => {
  const { eid } = req.query;

  // 404 if it does not exist, 403 if it belongs to another user
  await findOwnedEmployee(eid, req.user);

  // The filter also has the user id, so only the owner's employee can be deleted
  await Employee.deleteOne({ _id: eid, user: req.user.id });
  logger.info(`Employee ${eid} deleted by ${req.user.username}`);

  // 204 No Content: the delete worked and there is no response body
  res.status(204).send();
};

module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
