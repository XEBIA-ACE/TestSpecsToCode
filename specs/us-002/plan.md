# Implementation Plan — US-002: Redirect Unauthenticated Users to Login

## Architecture Decision

This implementation follows the existing hexagonal architecture pattern. Authentication middleware will be added as an inbound adapter concern, sitting between the HTTP layer and application services. The middleware will intercept requests to protected routes, validate JWT tokens, and either allow the request to proceed or issue a redirect response.

## Component Design

### 1. Authentication Middleware (`app/src/adapters/inbound/http/authMiddleware.js`)

A new Express middleware function that:
- Extracts JWT from `Authorization` header (Bearer scheme) or cookies
- Validates token signature and expiration using `jsonwebtoken`
- Attaches decoded user context to `req.user` if valid
- Returns 302 redirect with `returnUrl` if invalid/missing
- Logs audit entry for unauthenticated access attempts

```javascript
// Middleware signature
function requireAuth(req, res, next) {
  // Token extraction and validation
  // Audit logging for failures
  // Redirect or proceed
}
```

### 2. Configuration Updates (`app/src/config/env.js`)

Add new configuration values:
- `auth.loginUrl`: Default `/api/v1/users/login`
- `auth.defaultLandingUrl`: Default `/api/v1/users/me`
- `auth.jwtSecret`: Already exists, reuse

### 3. Route Protection (`app/src/adapters/inbound/http/userRouter.js`)

Apply `requireAuth` middleware to protected routes:
- `GET /api/v1/users/:id` — requires authentication
- `DELETE /api/v1/users/:id` — requires authentication

Public routes remain unprotected:
- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/verify-otp`
- `POST /api/v1/users/resend-otp`

### 4. Audit Logger Enhancement (`app/src/infrastructure/logger.js`)

Add structured audit logging method:
```javascript
logger.audit(event, metadata) // Uses 'info' level with audit prefix
```

### 5. Return URL Handling in Login Flow (`app/src/application/userService.js`)

Modify login response to include redirect URL when `returnUrl` query param is present and validated.

## API Contract Changes

### Protected Route Response (Unauthenticated)

```http
HTTP/1.1 302 Found
Location: /api/v1/users/login?returnUrl=%2Fapi%2Fv1%2Fusers%2F123
Content-Length: 0
```

### Login Success Response (With Return URL)

```json
{
  "data": {
    "user": { ... },
    "token": "jwt...",
    "redirectUrl": "/api/v1/users/123"
  }
}
```

## Data Model Changes

No database schema changes required. JWT tokens already contain user ID for validation.

## File Changes Summary

| Repository | File | Change Type |
|------------|------|-------------|
| XEBIA-ACE/TestSpecsToCode | `app/src/adapters/inbound/http/authMiddleware.js` | Create |
| XEBIA-ACE/TestSpecsToCode | `app/src/adapters/inbound/http/userRouter.js` | Modify |
| XEBIA-ACE/TestSpecsToCode | `app/src/config/env.js` | Modify |
| XEBIA-ACE/TestSpecsToCode | `app/src/infrastructure/logger.js` | Modify |
| XEBIA-ACE/TestSpecsToCode | `app/src/application/userService.js` | Modify |
| XEBIA-ACE/TestSpecsToCode | `app/tests/authMiddleware.test.js` | Create |
| XEBIA-ACE/TestSpecsToCode | `app/tests/userRouter.auth.test.js` | Create |

## Security Considerations

1. **Open Redirect Prevention**: Validate `returnUrl` is a relative path starting with `/` and does not contain protocol or domain
2. **Token Validation**: Use constant-time comparison for signatures
3. **Error Messages**: Generic "Authentication required" message, no token details exposed

## Testing Strategy

- Unit tests for `authMiddleware` with mocked JWT verification
- Integration tests for protected route access without token
- Integration tests for redirect flow with valid `returnUrl`
- Integration tests for open redirect prevention