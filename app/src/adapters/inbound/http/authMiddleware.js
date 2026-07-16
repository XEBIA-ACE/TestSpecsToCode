'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../../config/env');
const { UnauthorizedError } = require('../../../domain/errors/domainErrors');
const logger = require('../../../infrastructure/logger');

/**
 * Express middleware that validates a Bearer JWT from the Authorization header.
 *
 * On success, attaches the decoded payload to `req.user` and calls `next()`.
 * On failure, passes an UnauthorizedError to the next error handler.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Missing or malformed Authorization header'));
    }

    const token = authHeader.slice(7); // strip "Bearer "

    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach decoded payload so downstream handlers can access req.user.id etc.
    req.user = decoded;

    return next();
  } catch (err) {
    logger.warn('JWT validation failed', { error: err.message });

    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }

    return next(new UnauthorizedError('Authentication failed'));
  }
}

module.exports = authMiddleware;
