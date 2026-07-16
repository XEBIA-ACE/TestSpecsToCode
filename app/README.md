# User Management Service

## Overview

The **User Management Service** is a RESTful microservice responsible for:

- **User Registration** — create accounts with unique email validation
- **User Login** — authenticate users with password verification and account status checks
- **OTP Verification** — generate and deliver one-time passwords for email verification
- **Account Management** — retrieve user profiles and delete accounts

Built with **Node.js + Express** and backed by **PostgreSQL**, the service follows **hexagonal architecture** (ports and adapters) to keep domain logic decoupled from infrastructure concerns.

---

## Architecture

```
src/
├── index.js                  # Entry point — boots the HTTP server
├── app.js                    # Express app factory (no side-effects)
├── config/
│   └── env.js                # Centralised environment config
├── domain/
│   ├── entities/
│   │   └── user.js           # User entity / value objects
│   └── errors/
│       └── domainErrors.js   # Domain-specific error types
├── ports/
│   ├── inbound/
│   │   └── userServicePort.js   # Inbound port interface (JSDoc)
│   └── outbound/
│       ├── userRepositoryPort.js  # Outbound repo port interface
│       └── emailServicePort.js    # Outbound email port interface
├── application/
│   └── userService.js        # Core use-case orchestration
├── adapters/
│   ├── inbound/
│   │   └── http/
│   │       ├── userRouter.js       # Express routes
│   │       ├── userController.js   # Request → service → response
│   │       ├── authMiddleware.js   # JWT authentication middleware
│   │       └── validators.js       # express-validator rules
│   └── outbound/
│       ├── db/
│       │   ├── pgClient.js         # pg Pool singleton
│       │   └── userRepository.js   # SQL implementation of repo port
│       └── email/
│           └── nodemailerAdapter.js # Nodemailer implementation
└── infrastructure/
    └── logger.js             # Winston logger
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| PostgreSQL | ≥ 14 |
| Docker (optional) | ≥ 24 |

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd user-management-service
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE user_management;"
psql -U postgres -d user_management -f src/infrastructure/db/migrations/001_create_users.sql
```

### 4. Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## Running with Docker

```bash
# Build image
docker build -t user-management-service .

# Run container
docker run -p 3000:3000 --env-file .env user-management-service
```

Or with Docker Compose (if a `docker-compose.yml` is present):

```bash
docker compose up
```

---

## Authentication Middleware

The service uses JWT (JSON Web Token) based authentication to protect sensitive endpoints.

### How It Works

1. **Token Extraction**: The middleware extracts the JWT from the request in the following order of precedence:
   - `Authorization` header using the Bearer scheme
   - `token` cookie (for browser-based sessions)

2. **Token Validation**: The extracted token is verified against the configured `JWT_SECRET`. The middleware checks:
   - Token signature validity
   - Token expiration (`exp` claim)
   - Token structure and format

3. **User Context**: On successful validation, the decoded token payload is attached to `req.user`, making user information available to downstream handlers.

4. **Failure Handling**: If validation fails, the middleware:
   - Logs an audit entry with request details
   - Returns a 302 redirect to the login page with the original URL preserved

### Authorization Header Format

```http
Authorization: Bearer <jwt-token>
```

Example:
```http
GET /api/v1/users/123 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cookie-Based Token Support

For browser clients, the token can also be sent via a cookie named `token`:

```http
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Protected vs Public Routes

### Protected Routes (Require Authentication)

These routes require a valid JWT token. Unauthenticated requests will be redirected to the login page.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users/:id` | Retrieve user profile by ID |
| DELETE | `/api/v1/users/:id` | Delete user account |

### Public Routes (No Authentication Required)

These routes are accessible without authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check / liveness probe |
| POST | `/api/v1/users/register` | Register a new user account |
| POST | `/api/v1/users/login` | Authenticate and obtain JWT token |
| POST | `/api/v1/users/verify-otp` | Verify OTP for email confirmation |
| POST | `/api/v1/users/resend-otp` | Request a new OTP |

---

## Redirect Behavior

### Unauthenticated Access Redirect

When an unauthenticated user attempts to access a protected route, the system responds with an HTTP 302 redirect.

**Response:**
```http
HTTP/1.1 302 Found
Location: /api/v1/users/login?returnUrl=%2Fapi%2Fv1%2Fusers%2F123
Content-Length: 0
```

### The `returnUrl` Query Parameter

The `returnUrl` parameter preserves the user's originally requested URL, enabling seamless navigation after authentication.

- **Encoding**: The URL is percent-encoded to safely include special characters
- **Validation**: Only relative paths starting with `/` are accepted
- **Example**: Accessing `/api/v1/users/123` without auth redirects to `/api/v1/users/login?returnUrl=%2Fapi%2Fv1%2Fusers%2F123`

### Post-Login Redirect Flow

1. User attempts to access protected resource (e.g., `/api/v1/users/123`)
2. System redirects to login with `returnUrl` parameter
3. User successfully authenticates via `/api/v1/users/login`
4. Login response includes `redirectUrl` field with the validated return URL
5. Client redirects user to original destination

**Login Response with Return URL:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "redirectUrl": "/api/v1/users/123"
  }
}
```

### Fallback Behavior

If `returnUrl` is absent, invalid, or potentially malicious:
- System uses the default landing URL (`/api/v1/users/me`)
- No `redirectUrl` field is included in the login response

---

## Configuration

### Environment Variables

#### Authentication Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens | *Required* |
| `JWT_EXPIRES_IN` | Token expiration time (e.g., `1h`, `7d`) | `1h` |
| `AUTH_LOGIN_URL` | URL to redirect unauthenticated users | `/api/v1/users/login` |
| `AUTH_DEFAULT_LANDING_URL` | Default redirect after login (when no returnUrl) | `/api/v1/users/me` |

#### Example `.env` Configuration

```bash
# Authentication
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=1h
AUTH_LOGIN_URL=/api/v1/users/login
AUTH_DEFAULT_LANDING_URL=/api/v1/users/me
```

---

## Security Considerations

### Open Redirect Prevention

The `returnUrl` parameter is validated to prevent open redirect attacks:

- **Relative paths only**: URLs must start with `/`
- **No protocol injection**: URLs containing `://` are rejected
- **No domain specification**: URLs like `//evil.com` are rejected
- **Circular redirect prevention**: If `returnUrl` points to the login page itself, the default landing URL is used

**Rejected Examples:**
```
returnUrl=https://evil.com/steal-token
returnUrl=//evil.com/phishing
returnUrl=javascript:alert(1)
```

### Zero Data Exposure

For unauthenticated requests to protected routes:

- **No partial data**: Response body is empty (Content-Length: 0)
- **No user existence hints**: Same redirect behavior regardless of whether the requested user exists
- **No error details**: Generic redirect without revealing internal state

### Audit Logging

All unauthenticated access attempts are logged for security monitoring:

```json
{
  "level": "warn",
  "message": "[AUDIT] Unauthenticated access attempt",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "action": "redirect_to_login"
}
```

### Token Security Best Practices

1. **Use HTTPS**: Always transmit tokens over encrypted connections
2. **Secure cookies**: When using cookie-based tokens, set `Secure` and `HttpOnly` flags
3. **Short expiration**: Use short-lived tokens and implement refresh token rotation
4. **Secret rotation**: Periodically rotate `JWT_SECRET` in production

---

## API Reference

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness probe |

### Users

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/v1/users/register` | No | Register new user |
| POST | `/api/v1/users/login` | No | Authenticate user |
| POST | `/api/v1/users/verify-otp` | No | Verify email OTP |
| POST | `/api/v1/users/resend-otp` | No | Resend OTP |
| GET | `/api/v1/users/:id` | Yes | Get user profile |
| DELETE | `/api/v1/users/:id` | Yes | Delete user account |

---

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/authMiddleware.test.js
```

---

## License

MIT