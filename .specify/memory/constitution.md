# Constitution — US-002: Redirect Unauthenticated Users to Login

## Quality Principles

### Security First
- No account information may be exposed before successful authentication
- Session validation must occur before any protected resource access
- All authentication bypass attempts must be logged for audit purposes
- Redirect URLs must be validated to prevent open redirect vulnerabilities

### User Experience
- Redirect flow must be seamless with minimal user friction
- Original requested URL must be preserved and restored after login
- Error states must provide clear, non-technical feedback to users
- Response times for redirect must not exceed 100ms

### Code Quality Standards
- Follow existing hexagonal architecture patterns in the codebase
- Middleware must be stateless and composable
- All new code requires corresponding unit tests with >80% coverage
- Use existing domain error types for consistent error handling

## Architecture Guardrails

### Middleware Design
- Authentication middleware must be reusable across all protected routes
- Session state must not leak into request handlers
- Middleware chain order: security headers → authentication → route handler

### Logging & Audit
- Use existing Winston logger infrastructure
- Audit logs must include: timestamp, attempted URL, client IP, user agent
- Log level for auth failures: `warn`; for successful redirects: `info`

### API Contract Compliance
- HTTP 302 for temporary redirects to login
- Include `Location` header with login URL and return path
- Query parameter `returnUrl` must be URL-encoded

## Non-Functional Requirements

### Performance
- Authentication check latency: <10ms
- No additional database queries for unauthenticated requests
- Middleware must not block event loop

### Testability
- Authentication middleware must be injectable for testing
- Mock session stores must be supported in test environment
- Integration tests must cover redirect flow end-to-end

### Maintainability
- Document middleware usage in JSDoc comments
- Configuration for login URL must be centralized in `env.js`
- Audit log format must be consistent with existing logging patterns