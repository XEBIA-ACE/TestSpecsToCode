# Request OTP for Login Verification

| | |
|---|---|
| **ID** | US-009 |
| **Feature** | F-02 — OTP Verification |
| **Epic** | EP-002 — OTP Input and Verification |
| **Status** | Draft |
| **Date** | 2026-07-14 |

## Background

Part of feature *OTP Verification*.

## Acceptance Criteria

### Story

- [ ] Given a verified user has entered valid login credentials, When the system processes the login attempt, Then a cryptographically secure OTP is generated
- [ ] Given an OTP has been generated, When the system sends the OTP, Then it is delivered to the user's registered email within 15 seconds
- [ ] Given an OTP has been generated, When 5 minutes have elapsed, Then the OTP expires and cannot be used
- [ ] Given an OTP has been sent successfully, When the user views the login screen, Then a clear confirmation message indicates the OTP has been sent to their email
- [ ] Given an OTP delivery attempt occurs, When the delivery completes or fails, Then the attempt is logged for audit purposes including timestamp and delivery status
- [ ] Given a user with unverified or non-existent account enters credentials, When the system processes the login attempt, Then OTP generation is prevented and an appropriate error message is displayed

### Epic

- [ ] Given a user attempts to log in, when OTP is sent, then the user should receive it within 15 seconds.
- [ ] Given that OTP is correct, when the user submits, then the user should be logged in.
- [ ] Given that OTP is incorrect, when the user submits, then an error message is displayed.
- [ ] Given the user requests for OTP, when it is sent, then it should expire after 10 minutes.
- [ ] Ensure successful OTP matching is logged for audit purposes.

## Proposed Solution

### Functional Specification

## S-001

### Purpose
This specification defines the requirements for requesting a One-Time Password (OTP) for login verification, enhancing security through two-factor authentication.

### Scope
The spec covers all functionalities required for generating, delivering, and managing OTPs within the User Management Service for login verification purposes.

### Non-Goals
1. Design of the user interface
2. Management of user accounts beyond OTP needs
3. Detailed OTP algorithm specifics
4. Integration with third-party email services
5. OTP verification process
6. Long-term storage of OTPs
7. Infrastructure aspects of the email service
8. Handling non-OTP authentications
9. User registration process enhancements
10. System health endpoints

### Key Entities
- **User**: 
  - **id** (String)
  - **email** (String)
  - **verified** (Boolean)

- **OTP**: 
  - **code** (String)
  - **expiration_time** (Timestamp)
  - **status** (String) [e.g., sent, failed]

- **LoginAttempt**: 
  - **timestamp** (Timestamp)
  - **status** (String) [e.g., successful, failed]
  - **user_id** (String)

### Functional Requirements
- FR-001: The system SHALL generate a cryptographically secure OTP upon valid login credentials by verified users.
- FR-002: The system SHALL send the generated OTP to the user's registered email within 15 seconds.
- FR-003: The system SHALL expire the OTP 5 minutes after generation.
- FR-004: The system SHALL display a confirmation message indicating OTP dispatch on the login screen when an OTP is sent successfully.
- FR-005: The system SHALL log each OTP delivery attempt with a timestamp and status of delivery.
- FR-006: The system SHALL NOT generate an OTP for unverified or non-existent user accounts and MUST display an error message.

### Assumptions
- A-001: Users have a verified email linked to their account for OTP dispatch. (FR-001, FR-002)
- A-002: System clocks are synchronized to ensure accurate timing between generation and expiration. (FR-003)
- A-003: The email service can support a high number of concurrent OTP dispatches. (FR-002)

### Success Criteria
- SC-001: OTP delivery time should be less than 15 seconds in 95% of attempts.
- SC-002: OTP expiration must occur at most 5 minutes post-generation in 100% of cases.
- SC-003: Error messages for unverified users should achieve 99% accuracy in delivery.

### Priority Levels
- P1: FR-001
- P1: FR-002
- P1: FR-003
- P2: FR-004
- P2: FR-005
- P1: FR-006

### Edge Cases
- EC-001: Given a network delay, When OTP delivery is attempted, Then delivery MAY exceed 15 seconds but SHOULD NOT exceed 30 seconds.
- EC-002: Given a user enters incorrect credentials, When the system processes a login attempt, Then no OTP SHALL be generated.
- EC-003: Given an email service outage, When OTP delivery fails, Then the user SHOULD receive a retry option or alternative method.
- EC-004: Given duplicate OTP requests by a user within a 5-minute window, When an attempt is made, Then previous OTPs SHALL be invalidated.

### Independent Testability
**Preconditions**: Valid user credentials, verified user status, active internet connection.  
**Action**: User submits login with correct credentials.  
**Outcome**: User receives OTP email with functional code within specified time.

### Separation of Concerns
Functional specifications here focus on the secure generation and timely distribution of OTPs, ensuring verified users can access their accounts safely. Non-functional aspects like performance optimization and system architecture remain outside its purview.

### Technical Design

## S-001

## Technical Specification

### Contracts & Interfaces

#### API Contracts

- **POST /api/v1/users/otp/request**
  - **Request Body**: 
    - `user_id` (String): Required. Must be a verified user.
  - **Response Codes**:
    - `200 OK`: OTP generated and sent successfully.
    - `400 Bad Request`: User ID not found or not verified.
    - `500 Internal Server Error`: Failed to send OTP.
  - **Response Body**:
    - On Success: `{ "message": "OTP sent successfully."}`
    - On Failure: `{ "error": "Reason for failure."}`

### Test Strategy

- **Test Case 001**: Validate OTP request by verified user.
  - **Contract Property**: Successful generation and delivery; `200 OK`.
- **Test Case 002**: Validate response for unverified user requesting OTP.
  - **Contract Property**: Should return `400 Bad Request`.
- **Test Case 003**: Validate OTP expiration compliance with 5-minute time constraint.
  - **Contract Property**: Ensure OTP status changes to expired after 5 minutes.
- **Test Case 004**: Validate delivery within 15 seconds.
  - **Contract Property**: Measure and confirm delivery time in response logs.

### Implementation Approach

#### Data Model Changes

- **OTP Table**
  - **Columns**:
    - `user_id` (String, Foreign Key)
    - `code` (String, Generated, Non-null)
    - `expiration_time` (Timestamp, Non-null)
    - `status` (String, Enum [sent, expired, failed], Default: 'sent')
  - **Indexes**:
    - `user_id_idx`: On `user_id` for efficient lookup.

#### Core Implementation Logic

- **Class**: `OTPService`
  - **Method**: `generateOTP(userId: String): String`
    - SHAL generate a cryptographic token, save it with the `user_id`, and set `expiration_time`.
  - **Method**: `sendOTPEmail(userId: String, otpCode: String): void`
    - SHAL utilize the `EmailService` to send the OTP, handle callbacks to update delivery status.
  - **Method**: `expireOTP(otpCode: String): void`
    - SHAL update database entry to change status to 'expired' after 5 minutes.

#### Inter-Service Calls and Async Patterns

- **EmailService**: Asynchronous dispatch of OTP emails. Implement a callback through a Promise or async/await pattern to update `OTP.status` upon successful sending or when an error occurs.
  
#### Testing Approach

- **Unit Tests**: 
  - Test the `OTPService.generateOTP()` for proper token creation and database save.
  - Test `OTPService.sendOTPEmail()` using mock objects to simulate email delivery and response.
- **Integration Tests**: 
  - Verify end-to-end OTP request via `POST /api/v1/users/otp/request` to ensure workflow completion in expected time frame.
  - Simulate network delay to test edge cases EC-001 and EC-003.
  
### Architectural Decision Records

- **ADR-001**: Use of Existing Email Service
  - **Context**: Simplification of email sending process for OTP delivery.
  - **Decision**: Utilize the built-in `EmailService` to manage OTP email dispatch.
  - **Rationale**: Reduces implementation complexity and leverages existing infrastructure.
  - **Alternative**: Implement a new service, rejected due to increased complexity.

### Simplicity Gate Assessment

- **Appropriate**: All technical components directly support functional requirements FR-001 to FR-006, ensuring efficient request and delivery of OTPs.
- No potential over-engineering or under-specification detected.

### Affected Services and API Changes

- **Service**: User Management Service
- **New Endpoint Added**:
  - **Method**: `POST`
  - **Path**: `/api/v1/users/otp/request`
  - **Description**: Allows users to request an OTP for login verification.

## Affected Services

- `S-001`

## API Changes

| Service | Endpoint | Method | Change |
|---------|----------|--------|--------|
| `User Management Service` | `/api/v1/users/otp/request` | POST | modify |

## Open Questions / Gaps

_No gaps identified._