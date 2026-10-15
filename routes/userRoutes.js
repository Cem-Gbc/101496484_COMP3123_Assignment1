const express = require('express');
const { signup, login } = require('../controllers/userController');
const { signupRules, loginRules } = require('../validators/userValidator');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Base path: /api/v1/user
// Each route runs: rate limit -> validation rules -> validate (400 if invalid) -> controller
router.post('/signup', authLimiter, signupRules, validate, signup);
router.post('/login', authLimiter, loginRules, validate, login);

module.exports = router;
