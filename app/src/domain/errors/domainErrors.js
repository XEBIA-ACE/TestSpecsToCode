'use strict';

/**
 * Domain-specific error types.
 * These are thrown by the application layer and caught by the HTTP adapter
 * to produce appropriate HTTP responses.
 */

class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/** Thrown when a resource already exists (e.g. duplicate email). */
class ConflictError extends DomainError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/** Thrown when input validation fails at the domain level. */
class ValidationError extends DomainError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

/** Thrown when a requested resource cannot be found. */
class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** Thrown when authentication fails. */
class AuthenticationError extends DomainError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

/** Thrown when the caller lacks permission. */
class AuthorizationError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

module.exports = {
  DomainError,
  ConflictError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
};
