```python
import unittest
from unittest.mock import patch
from your_package_name.password_controller import PasswordController
from your_package_name.session_manager import SessionManager
from your_package_name.email_service import EmailService
from your_package_name.redis_rate_limiter import RedisRateLimiter

class TestIntegrationServices(unittest.TestCase):

    def setUp(self):
        self.password_controller = PasswordController()
        self.session_manager = SessionManager()
        self.email_service = EmailService()
        self.redis_rate_limiter = RedisRateLimiter()

    @patch('your_package_name.email_service.EmailService.send_email')
    def test_email_notification_on_password_change(self, mock_send_email):
        user_id = "user_id"
        self.password_controller.change_password(user_id, "current_password", "NewPassword123!")
        mock_send_email.assert_called_once_with(user_id, "Your password has been changed successfully.")

    @patch('your_package_name.session_manager.SessionManager.invalidate_sessions')
    def test_session_invalidation_post_password_change(self, mock_invalidate_sessions):
        user_id = "user_id"
        self.password_controller.change_password(user_id, "current_password", "NewPassword123!")
        mock_invalidate_sessions.assert_called_once_with(user_id)

    def test_rate_limiter_allows_initial_attempts(self):
        user_id = "user_id"
        for _ in range(5):
            allowed = self.redis_rate_limiter.is_allowed(user_id)
            self.assertTrue(allowed, "Rate limiter blocked a valid attempt")

    def test_rate_limiter_blocks_excessive_attempts(self):
        user_id = "user_id"
        for _ in range(5):
            self.redis_rate_limiter.is_allowed(user_id)  # Consume limit
        allowed = self.redis_rate_limiter.is_allowed(user_id)
        self.assertFalse(allowed, "Rate limiter failed to block excessive attempts")
        
if __name__ == '__main__':
    unittest.main()
```