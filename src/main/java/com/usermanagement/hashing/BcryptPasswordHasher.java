package com.usermanagement.hashing;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * BCrypt-based implementation of {@link PasswordHasher}.
 *
 * Uses Spring Security's BCryptPasswordEncoder with the default strength (10 rounds),
 * which satisfies the bcrypt/Argon2 requirement from the security constitution.
 *
 * The encoder automatically embeds a random salt in every hash, so no external
 * salt management is required.
 */
@Component
public class BcryptPasswordHasher implements PasswordHasher {

    private final BCryptPasswordEncoder encoder;

    public BcryptPasswordHasher() {
        // Strength 10 is the Spring Security default and provides a good
        // security/performance balance (well under the 3-second SLA).
        this.encoder = new BCryptPasswordEncoder(10);
    }

    /**
     * {@inheritDoc}
     *
     * Produces a BCrypt hash that includes the algorithm version, cost factor,
     * and salt in the returned string (e.g. {@code $2a$10$...}).
     */
    @Override
    public String hash(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Raw password must not be null or empty");
        }
        return encoder.encode(rawPassword);
    }

    /**
     * {@inheritDoc}
     *
     * Extracts the salt and cost factor from {@code hashedPassword} and re-hashes
     * {@code rawPassword} for a constant-time comparison, preventing timing attacks.
     */
    @Override
    public boolean matches(String rawPassword, String hashedPassword) {
        if (rawPassword == null || hashedPassword == null) {
            return false;
        }
        return encoder.matches(rawPassword, hashedPassword);
    }
}
