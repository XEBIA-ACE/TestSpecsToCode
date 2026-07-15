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