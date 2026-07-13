'use strict';

/**
 * Domain-specific error types.
 * These are thrown by the application layer and caught by the HTTP adapter
 * to produce appropriate HTTP status codes.
 */

class DomainError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Thrown when a resource is not found. */
class NotFoundError extends DomainError {
  /** @param {string} [message] */
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** Thrown when a conflict exists (e.g. duplicate email). */
class ConflictError extends DomainError {
  /** @param {string} [message] */
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/** Thrown when credentials are invalid. */
class UnauthorizedError extends DomainError {
  /** @param {string} [message] */
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** Thrown when the account is not yet verified. */
class AccountNotVerifiedError extends DomainError {
  /** @param {string} [message] */
  constructor(message = 'Account email is not verified') {
    super(message, 403);
  }
}

/** Thrown when an OTP is invalid or expired. */
class InvalidOtpError extends DomainError {
  /** @param {string} [message] */
  constructor(message = 'OTP is invalid or has expired') {
    super(message, 400);
  }
}

/** Thrown for general validation failures. */
class ValidationError extends DomainError {
  /** @param {string} [message] */
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

module.exports = {
  DomainError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  AccountNotVerifiedError,
  InvalidOtpError,
  ValidationError,
};
