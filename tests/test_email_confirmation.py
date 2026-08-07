```python
import unittest
from unittest.mock import patch
from user_management.controllers.PasswordController import PasswordController

class TestEmailConfirmation(unittest.TestCase):

    @patch('user_management.controllers.PasswordController.Mail')
    def test_send_confirmation_email_success(self, MockMail):
        mock_mail_instance = MockMail()
        
        controller = PasswordController()
        user_id = 1
        controller.send_confirmation_email(user_id)
        
        mock_mail_instance.send.assert_called_once()
        sent_msg = mock_mail_instance.send.call_args[0][0]
        
        self.assertEqual(sent_msg.recipients, ['user@example.com'])
        self.assertIn('Your password has been successfully changed.', sent_msg.body)

if __name__ == '__main__':
    unittest.main()
```

Ensure you update SMTP details in the configuration to match your settings, and replace the placeholder email retrieval logic with the actual implementation when integrating this code into your project.