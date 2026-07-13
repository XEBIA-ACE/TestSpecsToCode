'use strict';

const { body, param, validationResult } = require('express-validator');

/**
 * Middleware: collect express-validator errors and respond 422 if any.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const verifyOtpRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
];

const resendOtpRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const userIdRules = [
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  verifyOtpRules,
  resendOtpRules,
  userIdRules,
};
