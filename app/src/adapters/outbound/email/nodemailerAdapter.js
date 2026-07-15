```javascript
'use strict';

const nodemailer = require('nodemailer');
const config = require('../../config/env');

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure, 
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

/**
 * Sends an OTP to the specified email.
 *
 * @param {string} email - The recipient email address.
 * @param {string} otp - The OTP to be sent.
 */
async function sendOtp(email, otp) {
  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Email Verification',
    text: `Your one-time password for verification is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtp,
};
```