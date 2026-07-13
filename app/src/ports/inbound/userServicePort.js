'use strict';

/**
 * Inbound port — UserService interface.
 *
 * This file documents the contract that the application layer must fulfil.
 * Concrete implementations live in src/application/userService.js.
 *
 * @interface IUserService
 */

/**
 * @typedef {Object} RegisterInput
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} VerifyOtpInput
 * @property {string} email
 * @property {string} otp
 */

/**
 * @typedef {Object} ResendOtpInput
 * @property {string} email
 */

/**
 * @typedef {Object} PublicUser
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {boolean} isVerified
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Register a new user.
 * @function
 * @name IUserService#register
 * @param {RegisterInput} input
 * @returns {Promise<PublicUser>}
 * @throws {ConflictError} if email already exists
 */

/**
 * Authenticate a user.
 * @function
 * @name IUserService#login
 * @param {LoginInput} input
 * @returns {Promise<{ user: PublicUser, token: string }>}
 * @throws {UnauthorizedError} if credentials are invalid
 * @throws {AccountNotVerifiedError} if account is not verified
 */

/**
 * Verify a user's email with an OTP.
 * @function
 * @name IUserService#verifyOtp
 * @param {VerifyOtpInput} input
 * @returns {Promise<PublicUser>}
 * @throws {InvalidOtpError}
 */

/**
 * Resend a verification OTP.
 * @function
 * @name IUserService#resendOtp
 * @param {ResendOtpInput} input
 * @returns {Promise<void>}
 * @throws {NotFoundError}
 */

/**
 * Get a user by ID.
 * @function
 * @name IUserService#getUserById
 * @param {string} id
 * @returns {Promise<PublicUser>}
 * @throws {NotFoundError}
 */

/**
 * Delete a user account.
 * @function
 * @name IUserService#deleteUser
 * @param {string} id
 * @returns {Promise<void>}
 * @throws {NotFoundError}
 */

// This file is intentionally documentation-only (no runtime exports needed).
module.exports = {};
