# User Registration

## User Story Narrative
As a new user, I want to register an account so that I can access personalized features of the system.

## Acceptance Criteria
1. Given a user inputs their details, When the registration form is submitted, Then the account is created with unique email verification.
2. Given an email address is already in use, When a user attempts to register with that email, Then the system denies the registration and prompts for a different email.
3. Given a user registers with a valid email, When the registration is submitted, Then a confirmation email is sent to verify the email.

## Out-of-Scope Items
- Integration with social media login for registration.
- Advanced email confirmation mechanisms like link-based verification.
- Captcha or other anti-bot verification mechanisms.

## Cross-Service Dependencies
- Email service responsible for sending OTPs.
- Database service for storing user details securely.