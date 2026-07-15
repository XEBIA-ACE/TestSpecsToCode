'use strict';

const { validationResult } = require('express-validator');
const userService = require('../../../application/userService');
const logger = require('../../../infrastructure/logger');

/**
 * POST /api/v1/users/register
 *
 * Handles user registration requests.
 * Validates input, delegates to userService, and returns appropriate responses.
 *
 * Success:  201 Created  — { message, user }
 * Conflict: 409          — { error }
 * Invalid:  422          — { errors: [...] }
 * Server:   500          — { error }
 */
async function register(req, res, next) {
  // 1. Check express-validator results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { name, email, password } = req.body;

  try {
    const user = await userService.register({ name, email, password });

    return res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user,
    });
  } catch (err) {
    // Forward domain errors (ConflictError, etc.) to the global error handler
    next(err);
  }
}

module.exports = { register };
