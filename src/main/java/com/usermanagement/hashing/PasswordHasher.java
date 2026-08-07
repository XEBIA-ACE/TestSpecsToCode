package com.usermanagement.hashing;

/**
 * Contract for password hashing and verification.
 * Implementations must use a modern, salted hashing algorithm (bcrypt or Argon2).
 */
public interface PasswordHasher {

    /**
     * Hash a raw plaintext password.
     *
     * @param rawPassword the plaintext password to hash
     * @return the encoded (hashed) password string
     */
    String hash(String rawPassword);

    /**
     * Verify that a raw plaintext password matches a previously stored hash.
     *
     * @param rawPassword    the plaintext password supplied by the user
     * @param hashedPassword the stored hash to compare against
     * @return {@code true} if the password matches the hash, {@code false} otherwise
     */
    boolean matches(String rawPassword, String hashedPassword);
}
