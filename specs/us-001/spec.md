## View and Edit Profile Information

### Acceptance Criteria
- Users should be able to view their complete profile, including Name, Email, Registration Date, and Account Status, with the ability to edit only the Name field. Email, Registration Date, and Status are read-only. Name changes need real-time validation for length and character restrictions, sanitized against XSS, audited with a timestamp, IP, and user agent, and confirmed via email notification. The page must adhere to WCAG 2.1 AA standards and load under 2 seconds.

### Definition of Done
- Completion of security, performance, and accessibility testing, verifying load time, audit logging for name changes and successful email notifications.
- Unit tests cover more than 80%, with existing integration tests for authentication and email services passing.