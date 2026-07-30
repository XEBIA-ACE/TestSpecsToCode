To deliver secure credential storage, we will integrate bcrypt for hashing passwords before storing them in the database. This involves updating the user registration and login processes to utilize hashed passwords and ensuring that all current passwords in the database are migrated to hashed values. No changes will be made to the database schema itself, but data handling methods will undergo updates.

1. **Architecture Decisions**: The choice of bcrypt as it provides built-in salt and a significant computation cost, protecting against brute force attacks.
2. **API Contracts**: Adjustments in user registration and login endpoints to hash passwords.
3. **Data Model Changes**: A migration process to hash existing plain-text passwords.

Files that need modification include:
- `app/src/application/userService.js`: Update user registration and authentication functions.
- `app/tests/*`: New and existing tests to reflect the change in password handling should be implemented.