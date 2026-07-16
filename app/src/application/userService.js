```javascript
'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const pool = require('../infrastructure/db/pool');
const logger = require('../infrastructure/logger');
const config = require('../config/env');
const { User } = require('../domain/entities/user');
const {
  DuplicateEmailError,
  InvalidCredentialsError,
  UserNotFoundError,
  AccountNotVerifiedError,
  InvalidOtpError,
  OtpExpiredError,
} = require('../domain/errors/domainErrors');

const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

/**
 * User Service - Application layer orchestrating user-related use cases
 */
const userService = {
  /**
   * Register a new user account
   * @param {Object} params - Registration parameters
   * @param {string} params.name - User's name
   * @param {string} params.email - User's email
   * @param {string} params.password - User's password
   * @returns {Promise<Object>} Created user data
   */
  async register({ name, email, password }) {
    // Check for existing user
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new DuplicateEmailError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate OTP
    const otp = this._generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create user
    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, is_verified, otp, otp_expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, name, email, is_verified, created_at`,
      [userId, name, email.toLowerCase(), passwordHash, false, otp, otpExpiresAt]
    );

    const user = result.rows[0];

    logger.info('User registered', { userId: user.id, email: user.email });

    // TODO: Send OTP email via email adapter

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.is_verified,
      },
      message: 'Registration successful. Please verify your email with the OTP sent.',
    };
  },

  /**
   * Authenticate user and return token
   * @param {Object} params - Login parameters
   * @param {string} params.email - User's email
   * @param {string} params.password - User's password
   * @param {string|null} returnUrl - Optional return URL for post-login redirect
   * @returns {Promise<Object>} Authentication result with token and redirect URL
   */
  async login({ email, password }, returnUrl = null) {
    // Find user by email
    const result = await pool.query(
      'SELECT id, name, email, password_hash, is_verified, is_deleted FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is deleted
    if (user.is_deleted) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    // Check if account is verified
    if (!user.is_verified) {
      throw new AccountNotVerifiedError('Please verify your email before logging in');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    // Generate JWT token (simplified - in production use jsonwebtoken)
    const token = this._generateToken(user.id);

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Determine redirect URL
    const redirectUrl = returnUrl || config.auth.defaultLandingUrl;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
      redirectUrl,
    };
  },

  /**
   * Verify OTP for email verification
   * @param {Object} params - Verification parameters
   * @param {string} params.email - User's email
   * @param {string} params.otp - OTP code
   * @returns {Promise<Object>} Verification result
   */
  async verifyOtp({ email, otp }) {
    const result = await pool.query(
      'SELECT id, otp, otp_expires_at, is_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError('User not found');
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    if (!user.otp || user.otp !== otp) {
      throw new InvalidOtpError('Invalid OTP');
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      throw new OtpExpiredError('OTP has expired');
    }

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true, otp = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    logger.info('User email verified', { userId: user.id, email });

    return { message: 'Email verified successfully' };
  },

  /**
   * Resend OTP to user's email
   * @param {Object} params - Resend parameters
   * @param {string} params.email - User's email
   * @returns {Promise<Object>} Resend result
   */
  async resendOtp({ email }) {
    const result = await pool.query(
      'SELECT id, is_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError('User not found');
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return { message: 'Email already verified' };
    }

    // Generate new OTP
    const otp = this._generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      'UPDATE users SET otp = $1, otp_expires_at = $2, updated_at = NOW() WHERE id = $3',
      [otp, otpExpiresAt, user.id]
    );

    logger.info('OTP resent', { userId: user.id, email });

    // TODO: Send OTP email via email adapter

    return { message: 'OTP sent successfully' };
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, name, email, is_verified, created_at FROM users WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError('User not found');
    }

    const user = result.rows[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    };
  },

  /**
   * Delete user account
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(id) {
    const result = await pool.query(
      'UPDATE users SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND is_deleted = false RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError('User not found');
    }

    logger.info('User account deleted', { userId: id });
  },

  /**
   * Generate a cryptographically secure OTP
   * @private
   * @returns {string} OTP code
   */
  _generateOtp() {
    const digits = '0123456789';
    let otp = '';
    const randomBytes = crypto.randomBytes(OTP_LENGTH);
    for (let i = 0; i < OTP_LENGTH; i++) {
      otp += digits[randomBytes[i] % 10];
    }
    return otp;
  },

  /**
   * Generate JWT token (simplified implementation)
   * @private
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  _generateToken(userId) {
    // In production, use jsonwebtoken library
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  },
};

module.exports = userService;
```