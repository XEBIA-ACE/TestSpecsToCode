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
| POST | `/api/v1/users/register` | Register a new user |
| POST | `/api/v1/users/login` | Authenticate a user |
| POST | `/api/v1/users/verify-otp` | Verify email with OTP |
| POST | `/api/v1/users/resend-otp` | Resend verification OTP |
| GET | `/api/v1/users/:id` | Get user profile |
| DELETE | `/api/v1/users/:id` | Delete user account |

---

## Environment Variables

See [.env.example](.env.example) for the full list.

---

## Testing

```bash
# Run all tests
npm test

# With coverage
npm run test:coverage
```

---

## License

MIT
