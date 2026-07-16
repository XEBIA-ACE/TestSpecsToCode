'use strict';

/**
 * JWT Authentication Middleware
 *
 * Extracts the Bearer token from the Authorization header, verifies it using
 * the configured JWT_SECRET, and attaches the decoded payload to `req.user`.
 *
 * Responds with 401 Unauthorized for any of the following conditions:
 *  - Missing Authorization header
 *  - Authorization header does not use the Bearer scheme
 *  - Token is expired (TokenExpiredError)
 *  - Token signature is invalid (JsonWebTokenError)
 *  - Token is malformed
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers && req.headers.authorization;

  // 1. Require the Authorization header
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  // 2. Require the Bearer scheme
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
    return res.status(401).json({ error: 'Authorization header must use the Bearer scheme' });
  }

  const token = parts[1];

  // 3. Verify the token
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    // Covers TokenExpiredError, JsonWebTokenError (bad signature / malformed), etc.
    return res.status(401).json({ error: err.message || 'Invalid or expired token' });
  }
}

module.exports = authenticate;
