const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createEmployeeRules,
  getEmployeeRules,
  updateEmployeeRules,
  deleteEmployeeRules,
} = require('../validators/employeeValidator');
const {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

const router = express.Router();

// Every employee route needs a valid JWT
router.use(auth);

// Base path: /api/v1/emp
router.get('/employees', getEmployees);
router.post('/employees', createEmployeeRules, validate, createEmployee);
router.get('/employees/:eid', getEmployeeRules, validate, getEmployeeById);
router.put('/employees/:eid', updateEmployeeRules, validate, updateEmployee);
router.delete('/employees', deleteEmployeeRules, validate, deleteEmployee); // uses ?eid=xxx

module.exports = router;
