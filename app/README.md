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

## API Reference

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness probe |

### Users

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/users/register` | Register a new user account |
| POST | `/api/v1/users/login` | Authenticate user credentials |
| GET | `/api/v1/users/me/account` | Retrieve authenticated user's account information |

---

## GET /api/v1/users/me/account

Retrieves the account information for the currently authenticated user.

### Authentication

This endpoint requires a valid JWT Bearer token in the Authorization header.

### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | `Bearer <JWT>` | Yes |
| Accept | `application/json` | No |

### Successful Response

**Status Code:** `200 OK`

**Response Body:**

```json
{
  "data": {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "registrationDate": "2024-01-15T10:30:00Z",
    "accountStatus": "Verified"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data.name` | string | User's full name (firstName + lastName) |
| `data.email` | string | User's registered email address |
| `data.registrationDate` | string | ISO 8601 formatted date when the account was created |
| `data.accountStatus` | string | Account verification status: `"Verified"` or `"Pending Verification"` |

**Response Headers:**

```
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

### Error Responses

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 401 Unauthorized | Missing, invalid, or expired JWT token | `{"error": "Session expired. Please log in again."}` |
| 404 Not Found | User account not found in database | `{"error": "Account not found"}` |
| 500 Internal Server Error | Unexpected server error | `{"error": "An unexpected error occurred"}` |

### Example Request

```bash
curl -X GET "https://api.example.com/api/v1/users/me/account" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Accept: application/json"
```

### Example Successful Response

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate

{
  "data": {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "registrationDate": "2024-01-15T10:30:00Z",
    "accountStatus": "Verified"
  }
}
```

### Example Error Response (Unauthorized)

```bash
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Session expired. Please log in again."
}
```

### Notes

- Each successful access to this endpoint generates an audit log entry for compliance and security monitoring
- The endpoint returns read-only account information; modifications are not supported through this endpoint
- All data transmission must occur over HTTPS in production environments

---

## Environment Variables

See `.env.example` for the full list of configuration options.

---

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

---

## License

MIT