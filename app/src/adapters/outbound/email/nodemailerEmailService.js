```javascript
'use strict';

const nodemailer = require('nodemailer');
const config = require('../../config/env'); // Ensure this is configured with your environment variables

class NodemailerEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure, // true for 465, false for other ports
      auth: {
        user: config.smtpUser, // generated ethereal user
        pass: config.smtpPass, // generated ethereal password
      },
    });
  }

  async sendOtpEmail(to, otp) {
    try {
      const mailOptions = {
        from: config.emailFrom,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }
}

module.exports = new NodemailerEmailService();
```