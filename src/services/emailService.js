/**
 * Email Notification Service
 *
 * Sends a confirmation email to the user after a successful profile update.
 *
 * The `mailer` dependency is injected so it can be replaced with a real
 * transport (nodemailer, SendGrid, SES, etc.) in production and a stub in tests.
 */

'use strict';

/**
 * Sends a profile-update confirmation email.
 *
 * @param {Object} params
 * @param {string} params.toEmail   - Recipient email address
 * @param {string} params.name      - Updated display name
 * @param {Object} [params.mailer]  - Injectable mailer; must expose sendMail(options)
 * @returns {Promise<void>}
 */
async function sendProfileUpdateEmail({ toEmail, name, mailer }) {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to: toEmail,
    subject: 'Your profile has been updated',
    text: `Hi ${name},\n\nYour display name has been successfully updated.\n\nIf you did not make this change, please contact support immediately.\n\nRegards,\nThe Team`,
    html: `<p>Hi <strong>${name}</strong>,</p>
           <p>Your display name has been successfully updated.</p>
           <p>If you did not make this change, please contact support immediately.</p>
           <p>Regards,<br/>The Team</p>`,
  };

  if (mailer && typeof mailer.sendMail === 'function') {
    await mailer.sendMail(mailOptions);
  } else {
    // TODO: wire up a real mailer transport (nodemailer / SendGrid / SES)
    console.log('[EMAIL] Would send:', JSON.stringify(mailOptions));
  }
}

module.exports = { sendProfileUpdateEmail };
