# Register New User Account

| | |
|---|---|
| **ID** | US-017 |
| **Feature** | F-03 — Secure User Login |
| **Epic** | EP-001 — Implement Secure Authentication |
| **Status** | Draft |
| **Date** | 2026-07-15 |

## Background

Part of feature *Secure User Login*.

## Acceptance Criteria

### Story

- [ ] Given a user provides valid name, email, and password, when they submit the registration form, then a new unverified account is created and an OTP is sent to the provided email address
- [ ] Given an email address already exists in the system, when a user attempts to register with that email, then the system displays an appropriate error message and prevents duplicate registration
- [ ] Given a user submits the registration form, when the password is processed, then it is hashed using a secure algorithm before storage (no plaintext storage)
- [ ] Given valid registration data is submitted, when the system processes the request, then the response is returned within 2 seconds
- [ ] Given a user submits the form, when any required field is missing or invalid, then appropriate validation errors are displayed

### Epic

- [ ] Given a user, when they log in, then they must be able to use multi-factor authentication
- [ ] Given a user, when they attempt unauthorized access, then the system blocks the attempt
- [ ] Given the system, when in operation, then it should maintain a 99.9% uptime for authentication services

## Proposed Solution

### Functional Specification

## S-001

### Purpose
This specification defines the functional requirements for implementing the user registration capability in the User Management Service, allowing new users to create accounts, validate inputs, and trigger OTP for verification.

### Scope
The specification covers the registration aspect of the User Management Service, focusing on user input validation, email uniqueness, secure password handling, and OTP integration for account verification.

### Non-Goals
1. User login functionality
2. Password reset processes
3. User profile management
4. System performance beyond registration response
5. Notification preferences configuration
6. Advanced security features like multifactor authentication
7. Detailed audit logging
8. The visual design of the registration form
9. Backend system architecture
10. Third-party service integration details

### Key Entities
- **User**: 
  - `name` (string)
  - `email` (string)
  - `password` (string, hashed)
  - `isVerified` (boolean)

- **OTP**:
  - `code` (string)
  - `expiration_time` (datetime)

### Functional Requirements
- FR-001: The system SHALL accept user inputs including name, email, and password for registration.
- FR-002: The system MUST validate that the email follows a proper format.
- FR-003: The system MUST ensure the email is unique among existing users.
- FR-004: The system SHALL securely hash passwords before storage.
- FR-005: The system MUST NOT store passwords in plaintext.
- FR-006: The system SHALL generate an OTP and associate it with the user.
- FR-007: The system SHALL send the OTP to the provided email address.
- FR-008: The system SHOULD respond to the user within 2 seconds of submission with either success or error outcomes.
- FR-009: The system SHALL display appropriate error messages for invalid or missing inputs.
- FR-010: The system SHOULD inform the user if the email already exists in the system.

### Assumptions Propagation
- A-001: There is only one verification method through email (Assumed for FR-006, FR-007).
- A-002: OTP transmission is handled by an internal or external email service (Assumed for FR-007).

### Success Criteria
- SC-001: Registration response time is at most 2 seconds in 95% of cases.
- SC-002: Email uniqueness validation failure rate is less than 0.5% of cases.

### Priority Levels
- P1: Creating an unverified user account upon valid registration
- P1: Securing password with hashing
- P2: Validating email format and uniqueness
- P2: Ensuring registration response time
- P2: Displaying validation errors

### Edge Cases
- EC-001: Given a user submits an empty form, when processed, then the system displays a "required fields missing" message.
- EC-002: Given an invalid email format, when processed, then the system displays an "invalid email format" message.
- EC-003: Given a user attempts registration with an existing email, when processed, then the system displays a "duplicate email" message.
- EC-004: Given a registration form with a non-secure password, when processed, then the system SHOULD prompt for a stronger password. [NEEDS CLARIFICATION: What defines a non-secure password?] (Assumed: Less than 8 characters)

### Independent Testability
- Preconditions: User accesses registration form, system database with users exists
- User Action: Submit registration form with valid data
- Observable Outcome: Receive a success message and OTP email

### Separation of Concerns
The specification focuses on user experience and business rules, defining capabilities such as validation and security requirements without detailing system implementation. External services like email handling are referenced without specifying the technology.

### Technical Design

## S-001

### Contracts & Interfaces

#### API Contracts

1. **POST /api/v1/users/register**
   - **Request Body**:
     - `name`: string, required
     - `email`: string, required
     - `password`: string, required
   - **Response**:
     - 201 Created: User successfully registered, OTP sent
     - 400 Bad Request: Validation errors, e.g., "invalid email format", "duplicate email"
     - 500 Internal Server Error: Unhandled server exceptions

2. **POST /api/v1/users/otp/resend**
   - [NEEDS CLARIFICATION: Payload and response for OTP resend]
   - 200 OK: OTP resent successfully
   - 404 Not Found: User not found or already verified
   - 500 Internal Server Error: Unhandled server exceptions

### Test Strategy

#### Test Cases for Contracts

1. **POST /api/v1/users/register**
   - Verify response status 201 when valid inputs are provided.
   - Validate response status 400 when email is in an invalid format. (FR-002)
   - Validate response status 400 when email already exists. (FR-003)
   - Ensure response contains appropriate error messages for missing fields. (FR-009)

2. **Email Uniqueness and Validation**
   - Attempt registering with existing email and expect a "duplicate email" response. (FR-010)

3. **OTP Transmission**
   - Confirm that an OTP email is sent after successful registration. (FR-007)

### Implementation Approach

#### Data Model Changes

1. **User Table**
   - Add `isVerified` column: BOOLEAN, default `false`.
   - Ensure uniqueness of `email` column with an index.
   
2. **OTP Table**
   - `id`: UUID, primary key
   - `user_id`: Foreign key referencing User
   - `code`: VARCHAR
   - `expiration_time`: DATETIME

#### Core Implementation Logic

1. **RegistrationService**
   - `registerUser(name, email, password)`:
     - Validate email format via regex.
     - Check `email` uniqueness by querying `User` table.
     - Hash `password` using bcrypt before storage. (FR-004, FR-005)
     - Create the user entry with `isVerified = false`.
     - Generate OTP using `generateOtp()` method.

2. **OtpService**
   - `generateOtp(userId)`:
     - Generate a secure OTP code.
     - Set expiration time for OTP.
     - Save to OTP Table associated with the `user_id`.

#### Inter-Service Calls

1. **EmailService**
   - Invoke `sendEmail(to, subject, body)` via an external or internal service for sending the OTP. (Assumed: Email service available)

#### Async Patterns

Use asynchronous task queue (e.g., RabbitMQ) to handle sending email after user creation, ensuring non-blocking registration completion.

### Architectural Decision Records (ADRs)

1. **ADR-001: Email Format Validation**
   - **Context**: Need to validate user emails.
   - **Decision**: Use regex for initial validation.
   - **Rationale**: Simplicity and speed.
   - **Alternatives**: Third-party API validation; rejected due to complexity.

2. **ADR-002: Password Hashing**
   - **Context**: Security requirement for storing passwords.
   - **Decision**: Use bcrypt for password hashing.
   - **Rationale**: Industry standard for strong hashing.
   - **Alternatives**: MD5, SHA-1; rejected for security inadequacy.

### Simplicity Gate Assessment

- **Appropriate**: Each technical element maps respectively to at least one FR. Implementation aligns with all specified FRs, no over-engineering detected.

### Affected Services and API Changes

- **Service Affected**: User Management Service
- **API Changes**: Addition of endpoints `/api/v1/users/register` and integration of `/api/v1/users/otp/resend`.

## Affected Services

- `S-001`

## API Changes

| Service | Endpoint | Method | Change |
|---------|----------|--------|--------|
| `S-001` | `/api/v1/users/register` | POST | enhance |

## Open Questions / Gaps

_No gaps identified._