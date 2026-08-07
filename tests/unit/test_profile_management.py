```python
import unittest
from unittest.mock import patch, MagicMock
from app.user_management import UserManagement

class TestProfileManagement(unittest.TestCase):
    
    def setUp(self):
        self.user_management = UserManagement()
        self.mock_user_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "registration_date": "2023-01-01",
            "status": "Active"
        }
        self.updated_user_data = {
            "name": "Jane Doe"
        }

    @patch('app.user_management.db')
    def test_get_profile(self, mock_db):
        mock_db.get_user.return_value = self.mock_user_data
        result = self.user_management.get_user_profile("123")
        self.assertEqual(result, self.mock_user_data)
        mock_db.get_user.assert_called_once_with("123")

    @patch('app.user_management.db')
    @patch('app.user_management.send_email_notification')
    def test_update_profile_name(self, mock_send_email, mock_db):
        mock_db.update_user.return_value = True
        mock_send_email.return_value = True

        # Test name with valid characters
        is_updated = self.user_management.update_user_profile("123", self.updated_user_data)
        self.assertTrue(is_updated)
        mock_db.update_user.assert_called_once_with("123", self.updated_user_data)
        mock_send_email.assert_called_once()

        # Test name with XSS characters (security test)
        invalid_name_data = {"name": "<script>alert('xss');</script>"}
        is_updated = self.user_management.update_user_profile("123", invalid_name_data)
        self.assertFalse(is_updated)

        # Test too long name (validation test)
        long_name_data = {"name": "J" * 256}  # Assuming max length is 255
        is_updated = self.user_management.update_user_profile("123", long_name_data)
        self.assertFalse(is_updated)

    @patch('app.user_management.db')
    def test_audit_logging(self, mock_db):
        mock_audit_log = MagicMock()
        with patch('app.user_management.audit_log', mock_audit_log):
            self.user_management.update_user_profile("123", self.updated_user_data)
            mock_audit_log.assert_called_once()
```