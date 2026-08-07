```python
import unittest
from your_project_name.user_management.session_manager import SessionManager

class TestSessionInvalidation(unittest.TestCase):

    def setUp(self):
        self.session_manager = SessionManager()
        self.user_id = "test_user"

    def test_session_invalidation(self):
        # Simulate multiple active sessions
        session_tokens = [self.session_manager.create_session(self.user_id) for _ in range(3)]

        # Invalidate all sessions
        self.session_manager.invalidate_sessions(self.user_id)

        for token in session_tokens:
            self.assertFalse(self.session_manager.is_session_valid(token))

if __name__ == '__main__':
    unittest.main()
```

### Performance Test