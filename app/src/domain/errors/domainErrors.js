'use strict';

/**
 * Domain-specific error classes for the User Management Service.
 * All errors extend the base DomainError to allow consistent handling.
 */

class DomainError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code to return
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Thrown when a requested user cannot be found. */
class UserNotFoundError extends DomainError {
  constructor(message = 'User not found') {
    super(message, 404);
  }
}

/** Thrown when authentication credentials are invalid or missing. */
class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** Thrown when a user attempts an action they are not permitted to perform. */
class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/** Thrown when a duplicate resource (e.g. email) already exists. */
class ConflictError extends DomainError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/** Thrown when input validation fails at the domain layer. */
class ValidationError extends DomainError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

/** Thrown when the database or an external service is unavailable. */
class ServiceUnavailableError extends DomainError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}

module.exports = {
  DomainError,
  UserNotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  ServiceUnavailableError,
};
