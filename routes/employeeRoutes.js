const express = require('express');
const auth = require('../middleware/auth');
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
router.post('/employees', createEmployee);
router.get('/employees/:eid', getEmployeeById);
router.put('/employees/:eid', updateEmployee);
router.delete('/employees', deleteEmployee); // uses ?eid=xxx

module.exports = router;
