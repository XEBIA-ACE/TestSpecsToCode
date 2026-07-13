# AGENTS.md — User Management Service

> **Service:** User Management Service
> **Type:** Business Service
> **Stack:** Node.js · Express · bcrypt · PostgreSQL

---

## 1. Stack

| Technology | Role |
|---|---|
| **Node.js (v20 LTS)** | Runtime environment |
| **Express 4.x** | HTTP framework, routing, middleware |
| **PostgreSQL 15+** | Primary relational datastore |
| **pg / node-postgres** | PostgreSQL client for Node.js |
| **bcrypt** | Password hashing and comparison |
| **jsonwebtoken (JWT)** | Auth token generation and verification |
| **nodemailer** | OTP email delivery |
| **crypto (built-in)** | OTP generation |
| **zod** | Request schema validation |
| **dotenv** | Environment variable management |
| **winston** | Structured logging |
| **Jest** | Unit and integration test runner |
| **supertest** | HTTP integration testing |
| **node-pg-migrate** | Database migration management |
| **ESLint + Prettier** | Code style enforcement |

---

## 2. Project Structure

```
user-management-service/
├── src/
│   ├── config/
│   │   ├── db.js                  # pg Pool setup and connection export
│   │   ├── env.js                 # Validated env vars via zod (throws on missing)
│   │   └── logger.js              # Winston logger instance
│   ├── controllers/
│   │   ├── auth.controller.js     # register, login, logout handlers
│   │   ├── otp.controller.js      # sendOtp, verifyOtp handlers
│   │   └── user.controller.js     # getProfile, deleteAccount handlers
│   ├── middleware/
│   │   ├── authenticate.js        # JWT verification middleware
│   │   ├── errorHandler.js        # Centralised Express error handler
│   │   ├── rateLimiter.js         # express-rate-limit config for OTP routes
│   │   └── validate.js            # Zod schema validation middleware factory
│   ├── migrations/
│   │   ├── 001_create_users.sql   # users table DDL
│   │   └── 002_create_otps.sql    # otps table DDL
│   ├── models/
│   │   ├── user.model.js          # SQL queries for users table (no ORM)
│   │   └── otp.model.js           # SQL queries for otps table
│   ├── routes/
│   │   ├── auth.routes.js         # POST /auth/register, /auth/login
│   │   ├── otp.routes.js          # POST /otp/send, /otp/verify
│   │   ├── user.routes.js         # GET /users/me, DELETE /users/me
│   │   └── index.js               # Mounts all routers under /api/v1
│   ├── schemas/
│   │   ├── auth.schema.js         # Zod schemas for register/login payloads
│   │   ├── otp.schema.js          # Zod schemas for OTP payloads
│   │   └── user.schema.js         # Zod schemas for user update/delete
│   ├── services/
│   │   ├── auth.service.js        # Business logic: registration, login, token issue
│   │   ├── otp.service.js         # OTP generation, storage, expiry, email dispatch
│   │   └── user.service.js        # Profile retrieval, account deletion logic
│   ├── utils/
│   │   ├── hashPassword.js        # bcrypt hash/compare wrappers
│   │   ├── generateOtp.js         # crypto-based OTP generator
│   │   ├── sendEmail.js           # nodemailer transport wrapper
│   │   └── apiResponse.js         # Standardised JSON response helpers
│   └── app.js                     # Express app factory (no listen call)
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── auth.service.test.js
│   │   │   ├── otp.service.test.js
│   │   │   └── user.service.test.js
│   │   ├── models/
│   │   │   ├── user.model.test.js
│   │   │   └── otp.model.test.js
│   │   └── utils/
│   │       ├── hashPassword.test.js
│   │       └── generateOtp.test.js
│   ├── integration/
│   │   ├── auth.routes.test.js    # supertest against real test DB
│   │   ├── otp.routes.test.js
│   │   └── user.routes.test.js
│   └── helpers/
│       ├── dbSetup.js             # beforeAll/afterAll test DB bootstrap
│       └── factories.js           # Test data factories
├── .env.example                   # All required env keys with placeholder values
├── .env.test                      # Test environment overrides (committed, no secrets)
├── .eslintrc.json                 # ESLint config
├── .prettierrc                    # Prettier config
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── docker-compose.test.yml
├── jest.config.js
├── package.json
├── tasks.md                       # Agent-generated task tracker (see §3)
└── server.js                      # Entry point: imports app.js, calls app.listen()
```

---

## 3. Required Workflow

The agent **must** follow these steps in order. Do not skip or reorder.

### Step 1 — Read Specifications
- Read all spec documents provided for this service before writing any code.
- Identify every endpoint, business rule, validation requirement, and data contract.
- Note any ambiguities; insert a `## Blockers` section in `tasks.md` if any exist.

### Step 2 — Create `tasks.md`
Create `tasks.md` in the project root with the following structure:

```markdown
# tasks.md — User Management Service

## Status Legend
- [ ] Not started  - [~] In progress  - [x] Done  - [!] Blocked

## Phase 1: Project Scaffolding
- [ ] Initialise package.json with all dependencies
- [ ] Configure ESLint, Prettier, jest.config.js
- [ ] Create .env.example with all required keys
- [ ] Write Dockerfile and docker-compose files

## Phase 2: Database
- [ ] Write migration 001_create_users.sql
- [ ] Write migration 002_create_otps.sql
- [ ] Implement src/config/db.js

## Phase 3: Core Implementation
- [ ] Implement utils (hashPassword, generateOtp, sendEmail, apiResponse)
- [ ] Implement models (user.model.js, otp.model.js)
- [ ] Implement services (auth, otp, user)
- [ ] Implement controllers (auth, otp, user)
- [ ] Implement middleware (authenticate, validate, errorHandler, rateLimiter)
- [ ] Implement routes and mount in index.js
- [ ] Wire app.js and server.js

## Phase 4: Testing
- [ ] Write unit tests for all utils
- [ ] Write unit tests for all models
- [ ] Write unit tests for all services
- [ ] Write integration tests for all route groups
- [ ] Confirm ≥90% coverage

## Phase 5: Validation
- [ ] Run linter (zero errors)
- [ ] Run full test suite (all pass, ≥90% coverage)
- [ ] Verify Docker build succeeds
- [ ] Verify docker-compose up starts service and DB cleanly

## Blockers
<!-- List any spec ambiguities here -->
```

Update task status as each item is completed.

### Step 3 — Implement in Phase Order
- Complete each phase fully before moving to the next.
- After each file is written, mark its task `[x]` in `tasks.md`.
- Never leave a file half-implemented; stub functions must throw `new Error('Not implemented')`.

### Step 4 — Test
- Write tests **alongside** implementation, not after all code is written.
- Run `npm test` after each phase; fix failures before proceeding.
- Achieve ≥90% line and branch coverage before Phase 5.

### Step 5 — Validate
Run the following commands and confirm all pass before declaring the service complete:

```bash
npm run lint          # Zero ESLint errors
npm test              # All tests pass, coverage ≥90%
docker build -t user-management-service .   # Clean build
docker-compose up --build -d                # Service starts, DB connects
```

---

## 4. Coding Conventions

### General
- Use **ES Modules** (`"type": "module"` in `package.json`); use `import`/`export` throughout.
- Use `async/await` exclusively — no raw Promise chains or callbacks.
- All async route handlers must be wrapped in a `tryCatch` higher-order function or use `express-async-errors`.
- Never use `any` implicit types; use JSDoc annotations on all exported functions.

### Naming
| Construct | Convention | Example |
|---|---|---|
| Files | `kebab-case.js` | `auth.service.js` |
| Functions | `camelCase` | `registerUser()` |
| Constants | `SCREAMING_SNAKE_CASE` | `OTP_EXPIRY_MINUTES` |
| DB columns | `snake_case` | `email_verified` |
| Route paths | `kebab-case` | `/api/v1/auth/send-otp` |
| Environment vars | `SCREAMING_SNAKE_CASE` | `JWT_SECRET` |

### Architecture Rules
- **Controllers** only extract request data, call a service, and return a response. Zero business logic.
- **Services** contain all business logic. They call models, never `req`/`res` objects.
- **Models** contain only SQL queries. Return plain objects — no response shaping.
- **No circular imports.** Dependency direction: `routes → controllers → services → models → db`.
- Use `src/utils/apiResponse.js` for every JSON response:
  ```js
  // success
  export const ok = (res, data, message = 'Success') =>
    res.status(200).json({ success: true, message, data });
  // error (used by errorHandler)
  export const fail = (res, statusCode, message) =>
    res.status(statusCode).json({ success: false, message, data: null });
  ```

### Security
- Hash passwords with `bcrypt` at **saltRounds = 12**.
- OTPs must be **6-digit numeric**, generated via `crypto.randomInt(100000, 999999)`.
- OTPs expire after **10 minutes**; enforce expiry check in `otp.service.js`.
- Store only **hashed OTPs** in the database (bcrypt, saltRounds = 10).
- JWT tokens must include `userId`, `email`, and `iat`/`exp` claims.
- Never log passwords, OTP plaintext, or JWT secrets.
- All routes except `/auth/register` and `/auth/login` require the `authenticate` middleware.

### Environment Variables (define all in `.env.example`)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/user_mgmt
JWT_SECRET=changeme
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@example.com
```

---

## 5. Testing

### Framework & Configuration
```js
// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},                        // ESM — no transform needed with Node 20
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: { lines: 90, branches: 90, functions: 90, statements: 90 }
  },
  setupFilesAfterFramework: ['./tests/helpers/dbSetup.js']
};
```

### Unit Tests
- Location: `tests/unit/`
- Mock all external dependencies (DB pool, nodemailer, bcrypt) using `jest.mock()`.
- Each service function gets its own `describe` block.
- Required test cases per feature:

| Feature | Required Cases |
|---|---|
| `registerUser` | success, duplicate email → 409, invalid payload → 400 |
| `loginUser` | success, wrong password → 401, unverified account → 403, user not found → 404 |
| `sendOtp` | success, user not found → 404, rate limit hit |
| `verifyOtp` | success, expired OTP → 410, invalid OTP → 400, already verified → 409 |
| `deleteAccount` | success, unauthenticated → 401 |
| `hashPassword` | returns hash, hash differs from input, compare returns true/false |
| `generateOtp` | returns 6-digit string, output is numeric |

### Integration Tests
- Location: `tests/integration/`
- Use a dedicated test PostgreSQL database (`DATABASE_URL` from `.env.test`).
- Use `supertest` against the Express `app` instance (not a running server).
- `tests/helpers/dbSetup.js` must run migrations and truncate tables between tests.
- Each test must be fully isolated — no shared state between `it` blocks.

### Running Tests
```bash
npm test                          # Run all tests
npm run test:unit                 # Unit only
npm run test:integration          # Integration only
npm run test:coverage             # With coverage report
```

### package.json scripts (required)
```json
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js",
  "test": "node --experimental-vm-modules node_modules/.bin/jest",
  "test:unit": "jest tests/unit",
  "test:integration": "jest tests/integration",
  "test:coverage": "jest --coverage",
  "lint": "eslint src tests",
  "lint:fix": "eslint src tests --fix",
  "migrate": "node-pg-migrate up",
  "migrate:test": "NODE_ENV=test node-pg-migrate up"
}
```

---

## 6. Docker & CI

### Dockerfile
```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci --omit=dev

FROM base AS test-deps
RUN npm ci

FROM test-deps AS test
COPY . .
RUN npm test

FROM deps AS production
COPY src/ ./src/
COPY server.js ./
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### docker-compose.yml (development)
```yaml
version: '3.9'
services:
  api:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: user_mgmt
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d user_mgmt"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### docker-compose.test.yml (CI integration tests)
```yaml
version: '3.9'
services:
  test:
    build:
      context: .
      target: test-deps
    command: npm run test:coverage
    env_file: .env.test
    depends_on:
      db_test:
        condition: service_healthy

  db_test:
    image: postgres:15-alpine
    