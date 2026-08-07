```javascript
const request = require('supertest');
const app = require('../../app');
const userRepository = require('../../repositories/userRepository');
const sessionManager = require('../../services/sessionManager');
const emailService = require('../../services/emailService');

// Mock dependencies
jest.mock('../../repositories/userRepository');
jest.mock('../../services/sessionManager');
jest.mock('../../services/emailService');

describe('PasswordController', () => {
  describe('changePassword', () => {
    it('should invalidate sessions and send confirmation email upon successful password change', async () => {
      const userId = '12345';
      const currentPassword = 'OldPass!123';
      const newPassword = 'NewPass!456';

      userRepository.getUserById.mockResolvedValue({
        id: userId,
        passwordHash: 'hashedOldPassword',
        lastFivePasswords: [],
        email: 'user@example.com'
      });

      sessionManager.invalidateSessions.mockResolvedValue();

      const response = await request(app)
        .post('/change-password')
        .send({ userId, currentPassword, newPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');
      expect(sessionManager.invalidateSessions).toHaveBeenCalledWith(userId);
      expect(emailService.sendPasswordChangeConfirmation).toHaveBeenCalledWith('user@example.com');
    });
  });
});
```

This implementation includes the necessary changes to the `PasswordController` to handle session invalidation following a successful password change and corresponding updates to the session management system. It also includes a jest test file to verify this behavior. Note that framework and environment setups like Express, Redis, and Jest are implied to exist as per the project's context.