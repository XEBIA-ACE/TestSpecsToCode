'use strict';

const nodemailer = require('nodemailer');
const config = require('../../../config/env');
const logger = require('../../../infrastructure/logger');

/**
 * Nodemailer implementation of the EmailService port.
 */
class NodemailerEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.user
        ? { user: config.email.user, pass: config.email.pass }
        : undefined,
    });
  }

  /**
   * Send a verification OTP email.
   *
   * @param {string} to   - Recipient email address
   * @param {string} otp  - One-time password
   * @returns {Promise<void>}
   */
  async sendOtp(to, otp) {
    const mailOptions = {
      from: config.email.from,
      to,
      subject: 'Your verification code',
      text: `Your one-time verification code is: ${otp}\n\nIt expires in ${config.otp.expiryMinutes} minutes.`,
      html: `
        <p>Your one-time verification code is:</p>
        <h2 style="letter-spacing:4px">${otp}</h2>
        <p>It expires in <strong>${config.otp.expiryMinutes} minutes</strong>.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent to ${to}`);
    } catch (err) {
      logger.error(`Failed to send OTP email to ${to}`, { message: err.message });
      throw err;
    }
  }
}

module.exports = NodemailerEmailService;
