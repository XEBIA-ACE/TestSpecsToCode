'use strict';

const { body } = require('express-validator');

/**
 * Validation rules for the POST /register endpoint.
 *
 * Validates:
 *  - name:     required, non-empty string, 1–100 chars
 *  - email:    required, valid email format
 *  - password: required, min 8 chars (security baseline)
 */
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

module.exports = { registerValidationRules };
