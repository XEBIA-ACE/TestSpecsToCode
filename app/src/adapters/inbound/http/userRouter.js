'use strict';

const { Router } = require('express');
const { registerValidationRules } = require('./validators');
const { register } = require('./userController');

const userRouter = Router();

/**
 * POST /api/v1/users/register
 *
 * Register a new user account.
 *
 * Request body:
 *   { name: string, email: string, password: string }
 *
 * Responses:
 *   201 — Registration successful, returns public user object
 *   409 — Email already in use
 *   422 — Validation errors (missing/invalid fields)
 *   500 — Unexpected server error
 */
userRouter.post('/register', registerValidationRules, register);

module.exports = userRouter;
