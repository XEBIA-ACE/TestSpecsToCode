```python
import re
from app.services import db, send_email_notification, audit_log

class UserManagement:
    
    def get_user_profile(self, user_id):
        return db.get_user(user_id)
    
    def update_user_profile(self, user_id, profile_data):
        if not self._is_valid_name(profile_data.get("name", "")):
            return False
        
        if db.update_user(user_id, profile_data):
            send_email_notification(user_id, "Profile updated", "Your profile information has been updated.")
            audit_log(user_id, profile_data)
            return True
        
        return False
    
    def _is_valid_name(self, name):
        if not (0 < len(name) <= 255):
            return False
        
        # Check for XSS or malicious patterns
        if re.search(r'<[^>]*script', name, re.IGNORECASE):
            return False
        
        return True
```