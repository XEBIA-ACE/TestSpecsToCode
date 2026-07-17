# Implementation Plan — US-001: View Account Information from Dashboard

## Architecture Overview

This feature follows the existing hexagonal architecture pattern in the codebase. We will add a new endpoint to the user router that retrieves account information for the authenticated user, validates their session via JWT middleware, and creates an audit log entry upon successful access.

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HTTP Layer                                   │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐ │
│  │ userRouter.js   │───▶│ authMiddleware   │───▶│ validators.js  │ │
│  │ GET /me/account │    │ (JWT validation) │    │ (input rules)  │ │
│  └────────┬────────┘    └──────────────────┘    └────────────────┘ │
└───────────┼─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Layer                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      userService.js                              ││
│  │  getAccountInfo(userId) → { name, email, registrationDate,      ││
│  │                             accountStatus }                      ││
│  └─────────────────────────────────────────────────────────────────┘│
└───────────┬─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Infrastructure Layer                           │
│  ┌──────────────────────┐    ┌─────────────────────────────────────┐│
│  │ postgresUserRepo.js  │    │ auditLogService.js (new)            ││
│  │ findById(userId)     │    │ logAccess(userId, action, ip)       ││
│  └──────────────────────┘    └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

### Decision 1: Reuse Existing User Repository
The `PostgresUserRepository.findById()` method already retrieves all user fields needed. We will create a new service method that transforms the raw user data into the account information response format.

### Decision 2: JWT Authentication Middleware
Create a reusable authentication middleware that:
- Extracts the JWT from the Authorization header
- Validates signature, expiry, and issuer
- Attaches the decoded user ID to `req.user`
- Returns 401 for invalid/expired tokens

### Decision 3: Audit Logging Strategy
Implement audit logging as a fire-and-forget operation using the existing Winston logger initially. This can be enhanced to write to a dedicated audit_logs table in a future iteration. The audit entry will be logged after the response is prepared but before sending, ensuring it doesn't block the response.

### Decision 4: Account Status Derivation
The `accountStatus` field will be derived from the existing `isVerified` boolean:
- `isVerified === true` → "Verified"
- `isVerified === false` → "Pending Verification"

## API Contract Details

### Endpoint Definition
```
GET /api/v1/users/me/account
```

### Request Headers
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer <JWT> | Yes |
| Accept | application/json | No |

### Response Schema
```javascript
{
  "data": {
    "name": string,           // firstName + " " + lastName
    "email": string,          // user's email
    "registrationDate": string, // ISO 8601 format (createdAt)
    "accountStatus": string   // "Verified" | "Pending Verification"
  }
}
```

### Response Headers
```
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

## Data Model

No database schema changes required. The feature uses existing fields from the `users` table:

| Column | Usage |
|--------|-------|
| id | User identification for audit log |
| first_name | Combined with last_name for display name |
| last_name | Combined with first_name for display name |
| email | Displayed as-is |
| created_at | Formatted as registrationDate |
| is_verified | Mapped to accountStatus |

## File Changes by Repository

### Repository: XEBIA-ACE/TestSpecsToCode.git

#### New Files
| File Path | Purpose |
|-----------|---------|
| `app/src/adapters/inbound/http/authMiddleware.js` | JWT validation middleware |
| `app/src/infrastructure/auditLogService.js` | Audit logging service |
| `app/tests/accountInfo.test.js` | Integration tests for account info endpoint |
| `app/tests/authMiddleware.test.js` | Unit tests for auth middleware |

#### Modified Files
| File Path | Changes |
|-----------|---------|
| `app/src/adapters/inbound/http/userRouter.js` | Add GET /me/account route with auth middleware |
| `app/src/application/userService.js` | Add getAccountInfo() method |
| `app/src/adapters/inbound/http/validators.js` | Add validation rules for account endpoint (if needed) |
| `app/src/config/env.js` | Ensure JWT secret configuration is present |
| `app/package.json` | Add jsonwebtoken dependency if not present |

## Security Considerations

1. **JWT Validation**: Verify token signature using the configured secret, check expiry time, validate issuer claim if present
2. **No Sensitive Data in Response**: Password hash and OTP fields are never included in the response
3. **Cache Prevention**: Set appropriate cache-control headers to prevent browser caching of sensitive data
4. **Rate Limiting**: Consider adding rate limiting to prevent enumeration attacks (can use existing middleware pattern)
5. **HTTPS Enforcement**: Rely on infrastructure/reverse proxy for HTTPS termination; document requirement

## Performance Considerations

1. **Database Query Optimization**: Single query to users table using indexed primary key (id)
2. **Connection Pooling**: Leverage existing pg Pool configuration
3. **Async Audit Logging**: Fire-and-forget pattern ensures audit logging doesn't add latency
4. **Response Size**: Minimal payload (~200 bytes) ensures fast transmission

## Testing Strategy

1. **Unit Tests**: 
   - Auth middleware JWT validation (valid, expired, malformed tokens)
   - UserService.getAccountInfo() transformation logic
   - Audit log service formatting

2. **Integration Tests**:
   - Full request/response cycle with valid JWT
   - 401 response for missing/invalid authorization
   - Response format validation
   - Audit log creation verification

3. **Accessibility Testing**:
   - Manual testing with screen reader (NVDA/VoiceOver)
   - Automated contrast checking
   - Keyboard navigation verification