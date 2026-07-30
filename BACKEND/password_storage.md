# Password Storage Documentation

## Overview
This document provides an overview of how passwords are securely stored in the system using bcrypt, a leading cryptographic hashing algorithm. It also outlines the compliance measures taken to adhere to industry standards for password security.

## Bcrypt Usage
Bcrypt is used for hashing passwords in the system to enhance security. It incorporates a salt directly into the hashing process, which means each password has a unique hash even if the same password is used by multiple users. This built-in salting helps protect against rainbow table attacks.

### Benefits of Using Bcrypt
- **Resistance to Brute Force Attacks**: Bcrypt's adjustable cost factor allows us to increase the time it takes to hash a password, providing resistance against brute force attacks.
- **Salting Mechanism**: Automatically salts the password before hashing, which guards against certain types of attacks.
- **Secure Hashing**: The hashing process is irreversible, meaning stored hashes cannot be reverted back to passwords.

## Compliance with Security Standards
The use of bcrypt aligns with OWASP's recommendation for password storage which suggests using a strong hashing algorithm with salting.
- **No Plaintext Storage**: Passwords are never stored as plaintext in the system or logs.
- **Secure Hashing Practices**: Regular security reviews and updates to ensure the use of best practices in hashing.

## API Updates
### Registration Endpoint
The user registration endpoint now hashes passwords before storing.
### Login Endpoint
The login process has been updated to compare provided passwords against hashed values.

By following these guidelines, the application ensures secure credential storage while maintaining industry compliance.