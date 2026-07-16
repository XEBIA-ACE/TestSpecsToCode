```javascript
'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const userService = require('../../../application/userService');
const logger = require('../../../infrastructure/logger');
const { validateReturnUrl } = require('./returnUrlValidator');

const router = express.Router();

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/v1/users/register
 * Register a new user account
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await userService.register({ name, email, password });
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/users/login
 * Authenticate user and return token
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // Extract and validate returnUrl from query parameters
      const rawReturnUrl = req.query.returnUrl;
      const validatedReturnUrl = validateReturnUrl(rawReturnUrl);
      
      const result = await userService.login({ email, password }, validatedReturnUrl);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/users/verify-otp
 * Verify OTP for email verification
 */
router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const result = await userService.verifyOtp({ email, otp });
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/users/resend-otp
 * Resend OTP to user's email
 */
router.post(
  '/resend-otp',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await userService.resendOtp({ email });
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/users/:id
 * Get user profile by ID
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Valid user ID is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await userService.getUserById(id);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/v1/users/:id
 * Delete user account
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Valid user ID is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
```