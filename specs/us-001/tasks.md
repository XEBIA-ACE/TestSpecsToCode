# Implementation Tasks — US-001: View Account Information from Dashboard

> **Implementation note (2026-07-17)**: the tasks below describe the original
> standalone `app/` prototype (JWT + PostgreSQL). The shipped implementation
> instead extends `BACKEND/src/controllers/user-profile.controller.ts` /
> `BACKEND/src/routes/user-profile.routes.ts` (existing session-auth `GET
> /api/v1/users/me` endpoint) with a new `BACKEND/src/services/audit-log.service.ts`
> for `ACCOUNT_INFO_VIEW` logging and no-cache response headers. The `app/`
> folder has been removed from the repo. Kept below as the original design
> record.

## Repository: XEBIA-ACE/TestSpecsToCode.git

### Authentication Middleware
- [ ] add app/src/adapters/inbound/http/authMiddleware.js: implement JWT validation middleware that extracts Bearer token from Authorization header, verifies signature and expiry using jsonwebtoken, attaches decoded userId to req.user, and returns 401 UnauthorizedError for invalid tokens
- [ ] add app/tests/authMiddleware.test.js: write unit tests covering valid token extraction, expired token rejection, malformed token handling, missing Authorization header, and incorrect token format

### Audit Logging Service
- [ ] add app/src/infrastructure/auditLogService.js: implement AuditLogService class with logAccess(userId, action, ipAddress) method that writes structured audit entries via Winston logger with timestamp, userId, action type, and optional IP address
- [ ] update app/src/infrastructure/logger.js: add audit-specific log level or method if needed for structured audit log formatting

### User Service Enhancement
- [ ] modify app/src/application/userService.js: add getAccountInfo(userId) method that calls userRepository.findById(), transforms user data to account info format (name as firstName + lastName, email, registrationDate from createdAt, accountStatus from isVerified), and returns the formatted response object
- [ ] modify app/src/ports/inbound/userServicePort.js: add JSDoc documentation for getAccountInfo interface method

### API Endpoint Implementation
- [ ] modify app/src/adapters/inbound/http/userRouter.js: add GET /me/account route that uses authMiddleware for JWT validation, calls userService.getAccountInfo() with req.user.id, invokes auditLogService.logAccess() asynchronously, sets Cache-Control headers to no-store, and returns formatted JSON response
- [ ] modify app/src/adapters/inbound/http/validators.js: add accountInfoRules validation array if additional request validation is needed for the endpoint

### Configuration Updates
- [ ] modify app/src/config/env.js: verify jwt.secret and jwt.expiresIn configuration values are properly defined with secure defaults
- [ ] modify app/package.json: add jsonwebtoken dependency if not already present in dependencies

### Integration Tests
- [ ] add app/tests/accountInfo.test.js: write integration tests covering successful account info retrieval with valid JWT, 401 response for expired/invalid JWT, response format validation with all required fields, Cache-Control header verification, and audit log entry creation

### Domain Error Handling
- [ ] modify app/src/domain/errors/domainErrors.js: verify UnauthorizedError and NotFoundError are properly exported and have correct HTTP status codes for account info error scenarios

### Documentation
- [ ] modify app/README.md: add documentation for the new GET /api/v1/users/me/account endpoint including authentication requirements, response format, and error codes