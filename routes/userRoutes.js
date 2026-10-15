const express = require('express');
const { signup, login } = require('../controllers/userController');
const { signupRules, loginRules } = require('../validators/userValidator');
const validate = require('../middleware/validate');

const router = express.Router();

// Base path: /api/v1/user
// Each route runs: validation rules -> validate (400 if invalid) -> controller
router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);

module.exports = router;
