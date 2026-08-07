```python
import unittest
from your_project_name.user_management.password_hasher import BcryptPasswordHasher

class TestPasswordHashing(unittest.TestCase):

    def setUp(self):
        self.password_hasher = BcryptPasswordHasher()

    def test_password_hashing(self):
        password = "SecureP@ssw0rd!"
        hashed_password = self.password_hasher.hash_password(password)

        self.assertTrue(self.password_hasher.verify_password(password, hashed_password))

    def test_password_hash_is_unique(self):
        password = "SecureP@ssw0rd!"
        hash1 = self.password_hasher.hash_password(password)
        hash2 = self.password_hasher.hash_password(password)

        self.assertNotEqual(hash1, hash2)

if __name__ == '__main__':
    unittest.main()
```