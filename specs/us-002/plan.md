### Implementation Plan

1. **Enhance PasswordController (2959):**
   - Extend with methods to verify current password against stored hashes.
   - Add functionality to update passwords, invoking bcrypt via BcryptPasswordHasher (3005) for hashing.
   - Integrate password history checks to prevent reuse of the last 5 passwords.

2. **Enhance PasswordPolicyEvaluator (3012):**
   - Refactor to validate new password complexity requirements.
   - Integrate with UI components to prompt users on violations in real-time.

3. **Rate Limiting and Security Enhancements:**
   - Set up Redis to handle rate limiting, restricting attempts to 5 per hour per user, with appropriate lockout mechanisms.

4. **Session Invalidation:**
   - Implement session invalidation across all active sessions once a password change is successful.

5. **Email Confirmation:**
   - Incorporate email service integration to confirm password changes.

6. **Enhance Frontend Components (PasswordInput 2496, 2635):**
   - Display real-time feedback using PasswordStrengthBar (2498) for password complexity.
   - Implement show/hide functionality for better usability.

7. **Testing and Validation:**
   - Conduct unit and integration tests to ensure >80% code coverage and compliance with acceptance criteria.