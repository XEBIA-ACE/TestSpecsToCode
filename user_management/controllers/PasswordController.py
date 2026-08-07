```python
from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from bcrypt import hashpw, gensalt
from redis import Redis
import os

app = Flask(__name__)

# Configuration for email
app.config['MAIL_SERVER'] = 'smtp.example.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'user@example.com'
app.config['MAIL_PASSWORD'] = 'password'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

# Configuration for Redis
redis_client = Redis(host='localhost', port=6379, db=0)

class PasswordController:

    def change_password(self, user_id, current_password, new_password):
        # Example function to change user password

        # Here, verify current password, check password history, etc.
        # This is a placeholder for the actual logic which includes:
        # 1. Verify current password
        # 2. Validate new password complexity using PasswordPolicyEvaluator
        # 3. Check password against last 5 used

        # Rate limiting
        attempt_key = f'password-change-attempts:{user_id}'
        attempts = redis_client.get(attempt_key)

        if attempts and int(attempts) >= 5:
            return jsonify({"message": "Too many attempts, please try again later."}), 429

        # Placeholder for password change logic
        hashed = hashpw(new_password.encode('utf-8'), gensalt())
        # Simulate saving to a datastore and session invalidation

        # Reset attempt count upon successful password change
        redis_client.delete(attempt_key)
        
        # Send confirmation email
        self.send_confirmation_email(user_id)

        return jsonify({"message": "Password changed successfully."}), 200

    def send_confirmation_email(self, user_id):
        # Assume we retrieve the email address based on user_id
        # This should be replaced with actual logic for fetching user details
        email_address = self.get_user_email(user_id)

        msg = Message('Password Change Confirmation', 
                      sender='noreply@example.com', 
                      recipients=[email_address])
        msg.body = "Your password has been successfully changed."

        mail.send(msg)
    
    def get_user_email(self, user_id):
        # Placeholder for fetching user email from datastore
        return "user@example.com"
```