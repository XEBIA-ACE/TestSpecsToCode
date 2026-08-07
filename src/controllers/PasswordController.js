```javascript
const sessionManager = require('../services/sessionManager');
const passwordHasher = require('../services/BcryptPasswordHasher');
const passwordPolicyEvaluator = require('../services/PasswordPolicyEvaluator');
const emailService = require('../services/emailService');
const userRepository = require('../repositories/userRepository');

class PasswordController {
  static async changePassword(req, res) {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      // Verify current password
      const user = await userRepository.getUserById(userId);
      if (!user || !await passwordHasher.verify(currentPassword, user.passwordHash)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Validate new password against policy
      if (!passwordPolicyEvaluator.isValid(newPassword)) {
        return res.status(400).json({ error: 'New password does not meet policy requirements' });
      }

      // Verify new password is not among the last 5 used
      if (user.lastFivePasswords.includes(passwordHasher.hash(newPassword))) {
        return res.status(400).json({ error: 'New password cannot be a previously used password' });
      }

      // Hash new password
      const hashedPassword = await passwordHasher.hash(newPassword);

      // Update password in user repository
      await userRepository.updatePassword(userId, hashedPassword);

      // Invalidate active sessions
      await sessionManager.invalidateSessions(userId);

      // Send confirmation email
      emailService.sendPasswordChangeConfirmation(user.email);

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = PasswordController;
```