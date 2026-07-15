# Login to Account

| | |
|---|---|
| **ID** | US-019 |
| **Feature** | F-03 — Secure User Login |
| **Epic** | EP-001 — Implement Secure Authentication |
| **Status** | Draft |
| **Date** | 2026-07-15 |

## Background

Part of feature *Secure User Login*.

## Acceptance Criteria

### Story

- [ ] Given a verified user provides correct email and password, when they submit the login form, then they are authenticated and redirected to the dashboard
- [ ] Given a user provides incorrect credentials, when they submit the login form, then an appropriate error message is displayed without revealing which field is incorrect
- [ ] Given a user's account is not verified, when they attempt to log in, then the system prevents login and informs them to verify their account first
- [ ] Given a deleted user attempts to log in, when they submit credentials, then authentication is denied
- [ ] Given valid credentials are submitted, when the system processes the login request, then the response is returned within 1 second
- [ ] Given a user successfully logs in, when a session is established, then appropriate session management with expiration is implemented

### Epic

- [ ] Given a user, when they log in, then they must be able to use multi-factor authentication
- [ ] Given a user, when they attempt unauthorized access, then the system blocks the attempt
- [ ] Given the system, when in operation, then it should maintain a 99.9% uptime for authentication services

## Proposed Solution

### Functional Specification

## S-001

### Purpose
This specification describes the functional requirements for implementing secure login functionality in the User Management Service to ensure authenticated access for verified users.

### Scope
The scope covers the secure login feature within the User Management Service, handling user credential validation, session management, and response handling for successful and failed login attempts.

### Non-Goals
1. Password reset functionality
2. User registration process
3. Multifactor authentication implementation
4. Detailed session expiration policies
5. Audit logging for login attempts
6. Performance optimization beyond current specification
7. Integration with third-party identity providers
8. User interface design specifics
9. Localization and internationalization
10. Notification services for login events

### Key Entities
- **User**
  - Attributes: userId (String), email (String), passwordHash (String), isVerified (Boolean), isDeleted (Boolean)
- **Session**
  - Attributes: sessionId (String), userId (String), expiration (DateTime)

### Functional Requirements

**FR-001**: User Management Service SHALL authenticate users with verified accounts using their email and password.

**FR-002**: System MUST validate provided credentials against stored user data.

**FR-003**: User Management Service SHALL redirect authenticated users to the dashboard upon successful login.

**FR-004**: System MUST NOT disclose specific reasons for login failure to prevent guessing.

**FR-005**: User Management Service MUST inform users with unverified accounts to complete verification prior to logging in.

**FR-006**: System SHALL deny login attempts for deleted user accounts.

**FR-007**: System MUST ensure login responses are processed and returned within 1 second.

**FR-008**: On successful login, User Management Service SHALL establish a session with a set expiration.

**FR-009**: Session management should support automatic expiration and secure handling.

**FR-010**: System should provide error messages in a generic form to safeguard information security.

**Assumptions**

- **A-001**: Only verified users are allowed to log in.
- **A-002**: A user account marked as deleted cannot be reinstated by a login attempt.

### Success Criteria

**SC-001**: Authentication time less than or equal to 1 second.

**SC-002**: 100% successful redirection to dashboard after successful authentication.

**SC-003**: 95% accurate error feedback for invalid login attempts.

### Priority Levels
- **P1**: FR-001, FR-003, FR-007
- **P2**: FR-004, FR-005, FR-006, FR-008, FR-009
- **P3**: FR-010

### Edge Cases

**EC-001**: Given incorrect email and password, when login attempted, then display generic error.

**EC-002**: Given unverified email, when login attempted, then display verify account message.

**EC-003**: Given deleted account, when login attempted, then deny access without additional feedback.

### Independent Testability
**Test scenario**: Given a valid, verified user in the system with known credentials, when the user logs in, then they are redirected to the dashboard if login is successful within 1 second.

**Preconditions**: 
1. User account exists and is verified.
2. User credentials are valid.
3. System operational and accessible.

**User action**: Submit login form with credentials.

**Observable outcome**: User sees dashboard page.

### Technical Design

## S-001

### Contracts & Interfaces

**API Changes:**

- **Endpoint**: `POST /api/v1/users/login`
  - **Request Schema**:
    - `email`: String, required
    - `password`: String, required
  - **Response Schema**:
    - **Success (200 OK)**:
      - `sessionId`: String
      - `message`: "Login successful"
    - **Failure (400 Bad Request or 401 Unauthorized)**:
      - `error`: "Invalid credentials" or "Account not verified"

**Data Model Changes:**

- **Session Table** (`sessions`)
  - **Columns**:
    - `sessionId`: VARCHAR(255), Primary Key
    - `userId`: VARCHAR(255), Foreign Key referencing `users.userId`
    - `expiration`: DATETIME, NOT NULL
  - **Indexes**:
    - Index on `userId`

### Test Strategy

**Test Case 1**: Validate successful login returns session ID
- **Preconditions**: `userId` exists, is verified, correct `email` and `password`
- **Validation**: Response status is 200, `sessionId` exists

**Test Case 2**: Validate response for unverified user
- **Preconditions**: `userId` exists, is not verified
- **Validation**: Response status is 401, `error` has value "Account not verified"

**Test Case 3**: Validate generic error on invalid credentials
- **Preconditions**: Invalid `email` or `password`
- **Validation**: Response status is 401, `error` has value "Invalid credentials"

**Test Case 4**: Validate denial for deleted accounts
- **Preconditions**: `isDeleted` is true for `userId`
- **Validation**: Response status is 401, `error` has value "Invalid credentials"

### Implementation Approach

**Authentication Logic**:

- **Class**: `AuthService`
  - **Method**: `authenticateUser(email: String, password: String): User`

    1. Fetch user record with matching `email` from the `users` table.
    2. Validate using:
       - `isVerified`: MUST be true
       - `isDeleted`: MUST be false
       - Password verification using a hashing algorithm (e.g., BCrypt)

**Session Management**:

- **Class**: `SessionService`
  - **Method**: `createSession(userId: String): String`
  
    1. Generate a session ID.
    2. Set expiration time (e.g., current time plus 2 hours).
    3. Insert session record into the `sessions` table.

**Inter-Service Calls**:

- **None required**, all processing within User Management Service.

**ADR-001**: Use Node.js for Authentication
- **Context**: Consistent with other endpoints in Service
- **Decision**: Retain current Node.js environment
- **Rationale**: Simplifies deployment, maintains service homogeneity
- **Alternatives**: Migration to other environments, rejected due to resource constraints

### Simplicity Gate Assessment

- **Architectural layers**: Appropriately map to FR-001 through FR-010.
- **Integration points**: No unnecessary elements detected.
- **Assessment**: Appropriate

### Affected Services and API Changes

- **User Management Service** is the sole affected service.
- **API Change**: `POST /api/v1/users/login` now includes session management.

The design focuses solely on session management within authentication, aligning with functional requirements and scoped exclusions.

## Affected Services

- `S-001`

## API Changes

| Service | Endpoint | Method | Change |
|---------|----------|--------|--------|
| `S-001` | `/api/v1/users/login` | POST | modification |

## Open Questions / Gaps

_No gaps identified._