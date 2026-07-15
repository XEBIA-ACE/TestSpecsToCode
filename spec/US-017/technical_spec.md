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