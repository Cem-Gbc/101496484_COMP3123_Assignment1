const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Find one employee and check that it belongs to the logged-in user.
//  - 404 if no employee has this id
//  - 403 if the employee belongs to another user
const findOwnedEmployee = async (employeeId, user) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new AppError(404, 'Employee not found');
  }

  if (employee.user.toString() !== user.id) {
    logger.warn(`Access denied: user "${user.username}" tried to access employee ${employeeId} that belongs to another user`);
    throw new AppError(403, 'You do not have permission to access this employee');
  }

  return employee;
};

// One user cannot have two employees with the same email (409 Conflict).
// When updating, the employee that is being updated is skipped.
const checkEmailNotUsed = async (email, userId, skipEmployeeId) => {
  const filter = { user: userId, email };
  if (skipEmployeeId) {
    filter._id = { $ne: skipEmployeeId };
  }

  if (await Employee.exists(filter)) {
    throw new AppError(409, 'You already have an employee with this email');
  }
};

module.exports = { findOwnedEmployee, checkEmailNotUsed };
