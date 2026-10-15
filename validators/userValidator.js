const { body, checkExact } = require('express-validator');

// checkExact() rejects fields we do not expect (for example "role": "admin")
const exactBody = { locations: ['body'], message: 'This field is not allowed' };

// POST /api/v1/user/signup
const signupRules = checkExact(
  [
    body('username')
      .notEmpty().withMessage('Username is required').bail()
      .isString().withMessage('Username must be a string').bail()
      .trim()
      .toLowerCase()
      .isLength({ min: 3, max: 30 }).withMessage('Username must be 3 to 30 characters')
      .matches(/^[a-z0-9_.]+$/).withMessage('Username can only contain letters, numbers, dots and underscores'),

    body('email')
      .notEmpty().withMessage('Email is required').bail()
      .isString().withMessage('Email must be a string').bail()
      .trim()
      .toLowerCase()
      .isLength({ max: 100 }).withMessage('Email must be at most 100 characters')
      .isEmail().withMessage('Email must be a valid email address'),

    body('password')
      .notEmpty().withMessage('Password is required').bail()
      .isString().withMessage('Password must be a string').bail()
      .isLength({ min: 8, max: 64 }).withMessage('Password must be 8 to 64 characters')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
  ],
  exactBody
);

// POST /api/v1/user/login - (username or email) + password
const loginRules = checkExact(
  [
    // Username is only required when no email is sent
    body('username')
      .if(body('email').not().exists())
      .notEmpty().withMessage('Username or email is required').bail()
      .isString().withMessage('Username must be a string').bail()
      .trim()
      .toLowerCase(),

    body('email')
      .optional()
      .isString().withMessage('Email must be a string').bail()
      .trim()
      .toLowerCase()
      .isEmail().withMessage('Email must be a valid email address'),

    body('password')
      .notEmpty().withMessage('Password is required').bail()
      .isString().withMessage('Password must be a string'),
  ],
  exactBody
);

module.exports = { signupRules, loginRules };
