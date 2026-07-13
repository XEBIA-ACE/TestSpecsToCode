'use strict';

/**
 * Outbound port — EmailService interface.
 *
 * Concrete implementation: src/adapters/outbound/email/nodemailerEmailService.js
 *
 * @interface IEmailService
 */

/**
 * Send a verification OTP to the given email address.
 * @function
 * @name IEmailService#sendOtp
 * @param {string} to      - Recipient email address
 * @param {string} otp     - One-time password to include in the email
 * @returns {Promise<void>}
 */

module.exports = {};
