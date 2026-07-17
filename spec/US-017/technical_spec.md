# User Registration Process Documentation

## Overview

This document provides detailed information on the user registration process for the User Management Service, including API usage, dependencies, and functionality critical to the feature.

## Feature Description

The User Registration feature allows new users to create an account in the system. The process ensures that:
- User passwords are securely hashed.
- Emails must be unique and verified through a One-Time Password (OTP) mechanism before account activation.
- Appropriate error messages are shown for invalid or duplicate email attempts.

## API Endpoints

### POST /api/v1/users/register

**Description:** Initiates the user registration process. After receiving user information such as name, email, and password, it creates a new user account and sends an OTP to the provided email for verification.

#### Request
- **Method:** POST
- **Path:** `/api/v1/users/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "securePassword123"
  }
  ```

#### Response

- **Success (201 Created):**
  ```json
  {
    "message": "Registration successful. Please verify your email to complete the process."
  }
  ```
- **Error (400 Bad Request):**
  ```json
  {
    "error": "Email is already in use."
  }
  ```
- **Error (422 Unprocessable Entity):**
  ```json
  {
    "error": "Invalid request data. Please ensure all fields are correctly filled."
  }
  ```

## Dependencies

### bcrypt

- **Role:** Hashes user passwords using the library to ensure passwords are stored securely and not in plaintext.
- **Integration:** Utilized within the registration handler to hash passwords before saving them in the database.

### nodemailer

- **Role:** Responsible for sending OTPs via email as part of the email verification process.
- **Integration:** Configured to dispatch an OTP email to the user after successful registration request acceptance.

### PostgreSQL

- **Role:** Backend database that stores user information, including hashed passwords and verification status.
- **Integration:** In conjunction with the user registration feature, PostgreSQL ensures user data is stored securely and efficiently.

## Functionality

### Password Hashing
User passwords are hashed using bcrypt before storage to prevent exposure in plaintext.

### Email Verification
After registration with a valid email:
- An OTP is generated and sent via email.
- The user must verify the OTP to activate their account.

### Error Handling
- Duplicate emails trigger a prompt to use a different address.
- Input validations ensure all required fields are present and correctly formatted.

## Configuration Details

### Environment Variables (as seen in `.env.example`)

- **SMTP_HOST**: SMTP server hostname for email dispatch.
- **SMTP_PORT**: Port for connecting to the SMTP server.
- **EMAIL_FROM**: Sender email address configured for sending OTPs.
- **SMTP_USER** and **SMTP_PASS**: Credentials for authenticating with the SMTP server.
- **OTP_EXPIRY_MINUTES**: Time duration before an OTP expires.

Ensure these variables are correctly set up for the system to function as expected.

---

This documentation should be updated concurrently with any changes to the registration process to maintain accuracy and completeness.