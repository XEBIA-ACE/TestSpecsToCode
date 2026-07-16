# Implementation Tasks — US-002: Redirect Unauthenticated Users to Login

## Repository: XEBIA-ACE/TestSpecsToCode

### Authentication Middleware

- [ ] create app/src/adapters/inbound/http/authMiddleware.js: implement requireAuth middleware that extracts JWT from Authorization header, validates token, and returns 302 redirect to login with returnUrl for invalid/missing tokens
- [ ] modify app/src/config/env.js: add auth.loginUrl and auth.defaultLandingUrl configuration properties with sensible defaults
- [ ] modify app/src/infrastructure/logger.js: add audit logging method for structured security event logging with timestamp, path, IP, and user agent

### Route Protection

- [ ] modify app/src/adapters/inbound/http/userRouter.js: import authMiddleware and apply requireAuth to GET /:id and DELETE /:id routes while keeping register, login, verify-otp, and resend-otp public
- [ ] modify app/src/adapters/inbound/http/userRouter.js: add returnUrl validation utility function to prevent open redirect attacks by ensuring URL is relative path

### Login Flow Enhancement

- [ ] modify app/src/application/userService.js: update login method to accept optional returnUrl parameter and include validated redirectUrl in response when present
- [ ] modify app/src/adapters/inbound/http/userRouter.js: extract returnUrl query parameter from login request and pass to userService.login

### Unit Tests

- [ ] create app/tests/authMiddleware.test.js: write unit tests covering valid token passthrough, missing token redirect, expired token redirect, malformed token handling, and audit log generation
- [ ] create app/tests/returnUrlValidator.test.js: write unit tests for returnUrl validation covering relative paths, absolute URLs rejection, protocol injection prevention, and null/undefined handling

### Integration Tests

- [ ] create app/tests/userRouter.auth.test.js: write integration tests for GET /api/v1/users/:id without token expecting 302 redirect to login with returnUrl
- [ ] create app/tests/userRouter.auth.test.js: write integration tests for successful login with returnUrl parameter expecting redirectUrl in response
- [ ] modify app/tests/health.test.js: add test verifying /health endpoint remains accessible without authentication

### Documentation

- [ ] modify app/README.md: document authentication middleware usage, protected vs public routes, and returnUrl query parameter behavior