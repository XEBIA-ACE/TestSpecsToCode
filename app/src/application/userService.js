'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { createUser, toPublicUser } = require('../domain/entities/user');
const {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  AccountNotVerifiedError,
  InvalidOtpError,
} = require('../domain/errors/domainErrors');
const config = require('../config/env');

const SALT_ROUNDS = 12;

/**
 * Application service — orchestrates domain logic.
 * Depends on outbound ports (repository + email) injected via constructor.
 */
class UserService {
  /**
   * @param {Object} deps
   * @param {import('../ports/outbound/userRepositoryPort')} deps.userRepository
   * @param {import('../ports/outbound/emailServicePort')}  deps.emailService
   */
  constructor({ userRepository, emailService }) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  // ── Registration ──────────────────────────────────────────────────────

  /**
   * Register a new user.
   *
   * @param {{ email: string, password: string, firstName: string, lastName: string }} input
   * @returns {Promise<Object>} Public user representation
   */
  async register({ email, password, firstName, lastName }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser({ email, passwordHash, firstName, lastName });

    // Generate and attach OTP
    const { otp, otpHash, otpExpiresAt } = this._generateOtp();
    user.otpCode = otpHash;
    user.otpExpiresAt = otpExpiresAt;

    const saved = await this.userRepository.save(user);

    // Fire-and-forget email (errors are logged but don't fail registration)
    this.emailService.sendOtp(saved.email, otp).catch(() => {});

    return toPublicUser(saved);
  }

  // ── Login ─────────────────────────────────────────────────────────────

  /**
   * Authenticate a user.
   *
   * @param {{ email: string, password: string }} input
   * @returns {Promise<{ user: Object }>}
   */
  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new AccountNotVerifiedError();
    }

    return { user: toPublicUser(user) };
  }

  // ── OTP Verification ──────────────────────────────────────────────────

  /**
   * Verify a user's email with an OTP.
   *
   * @param {{ email: string, otp: string }} input
   * @returns {Promise<Object>} Updated public user
   */
  async verifyOtp({ email, otp }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new InvalidOtpError();
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      throw new InvalidOtpError('OTP has expired');
    }

    const otpMatch = await bcrypt.compare(otp, user.otpCode);
    if (!otpMatch) {
      throw new InvalidOtpError('OTP is incorrect');
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.updatedAt = new Date();

    const updated = await this.userRepository.update(user);
    return toPublicUser(updated);
  }

  // ── Resend OTP ────────────────────────────────────────────────────────

  /**
   * Resend a verification OTP.
   *
   * @param {{ email: string }} input
   * @returns {Promise<void>}
   */
  async resendOtp({ email }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { otp, otpHash, otpExpiresAt } = this._generateOtp();
    user.otpCode = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.updatedAt = new Date();

    await this.userRepository.update(user);
    await this.emailService.sendOtp(user.email, otp);
  }

  // ── Account Management ────────────────────────────────────────────────

  /**
   * Get a user by ID.
   *
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toPublicUser(user);
  }

  /**
   * Delete a user account.
   *
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await this.userRepository.deleteById(id);
  }

  // ── Private helpers ───────────────────────────────────────────────────

  /**
   * Generate a numeric OTP, its bcrypt hash, and expiry timestamp.
   *
   * @returns {{ otp: string, otpHash: string, otpExpiresAt: Date }}
   */
  _generateOtp() {
    const length = config.otp.length;
    const otp = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    // Synchronous hash is acceptable for short OTPs
    const otpHash = bcrypt.hashSync(otp, 10);
    const otpExpiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);
    return { otp, otpHash, otpExpiresAt };
  }
}

module.exports = UserService;
