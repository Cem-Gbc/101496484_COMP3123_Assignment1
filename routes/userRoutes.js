const express = require('express');
const { signup, login } = require('../controllers/userController');

const router = express.Router();

// Base path: /api/v1/user
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
