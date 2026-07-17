# Constitution — US-001: View Account Information from Dashboard

## Quality Principles

### Performance Standards
- Page load time must not exceed 1 second (P95) under normal load conditions
- API response time for account information endpoint must be ≤ 500ms
- Database queries must complete within 100ms; use connection pooling
- Implement caching headers where appropriate to reduce redundant requests

### Security Requirements
- All data transmission must occur exclusively over HTTPS (TLS 1.2+)
- Session validation must occur before any user data is retrieved or displayed
- JWT tokens must be validated for expiry, signature, and issuer before granting access
- Audit logs must not contain sensitive PII beyond user ID; no passwords or tokens in logs
- Implement rate limiting on the account information endpoint to prevent enumeration attacks

### Accessibility Standards (WCAG 2.1 Level AA)
- Color contrast ratio must be at least 4.5:1 for normal text, 3:1 for large text
- All interactive elements must be keyboard navigable with visible focus indicators
- Screen reader support: proper ARIA labels, landmarks, and live regions
- Form fields and data displays must have associated labels
- No content should rely solely on color to convey information

### Coding Standards
- Follow existing hexagonal architecture patterns (ports/adapters)
- Use strict mode ('use strict') in all JavaScript files
- JSDoc comments required for all public functions and classes
- Error handling must use domain-specific error classes from `domainErrors.js`
- All new code must have corresponding unit tests with ≥80% coverage
- Use async/await consistently; avoid callback patterns
- Validate all inputs at the HTTP adapter layer using express-validator

### Architecture Guardrails
- Read-only operations must not modify user state
- Audit logging must be non-blocking (fire-and-forget with error logging)
- Session/authentication middleware must be reusable across routes
- Database access only through repository pattern (PostgresUserRepository)
- Configuration values must come from `config/env.js`, never direct `process.env` access

### Non-Functional Requirements
- Audit log entries must include: timestamp (ISO 8601), user ID, action type, and IP address
- System must gracefully handle database connection failures with appropriate error messages
- Logging must use structured format via Winston logger
- HTTP responses must include appropriate cache-control headers for security (no-store for sensitive data)