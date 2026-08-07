package com.usermanagement.controller;

import com.usermanagement.exception.InvalidCurrentPasswordException;
import com.usermanagement.hashing.PasswordHasher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller that handles password-management operations for the
 * User_Management application.
 *
 * <p>This controller satisfies the following acceptance criteria from the
 * "Change Account Password" user story (US-002):
 * <ul>
 *   <li>Current password must be verified before allowing a password update.</li>
 *   <li>Verification integrates with the existing {@link PasswordHasher} hashing
 *       strategy (BCrypt via {@code BcryptPasswordHasher}).</li>
 * </ul>
 *
 * <p>Additional concerns (rate limiting, session invalidation, email confirmation,
 * password-history checks) are handled by collaborating services and are wired in
 * via constructor injection so they can be swapped or mocked in tests.
 */
@RestController
@RequestMapping("/api/password")
public class PasswordController {

    private final PasswordHasher passwordHasher;
    private final UserCredentialService userCredentialService;

    public PasswordController(PasswordHasher passwordHasher,
                              UserCredentialService userCredentialService) {
        this.passwordHasher = passwordHasher;
        this.userCredentialService = userCredentialService;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Change the authenticated user's password.
     *
     * <p>The request body must contain:
     * <ul>
     *   <li>{@code userId}       – identifier of the account being updated</li>
     *   <li>{@code currentPassword} – the user's existing plaintext password</li>
     *   <li>{@code newPassword}  – the desired new plaintext password</li>
     * </ul>
     *
     * <p>Processing steps:
     * <ol>
     *   <li>Load the stored hash for {@code userId}.</li>
     *   <li>Verify {@code currentPassword} against the stored hash
     *       ({@link #verifyCurrentPassword}).</li>
     *   <li>Delegate further validation and persistence to
     *       {@link UserCredentialService#updatePassword}.</li>
     * </ol>
     *
     * @param request map containing {@code userId}, {@code currentPassword},
     *                and {@code newPassword}
     * @return 200 OK on success; 400/401 on validation or auth failure
     * @throws InvalidCurrentPasswordException if the current password does not
     *                                         match the stored hash
     */
    @PostMapping("/change")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> request) {

        String userId          = request.get("userId");
        String currentPassword = request.get("currentPassword");
        String newPassword     = request.get("newPassword");

        // 1. Retrieve the stored hash for this user.
        String storedHash = userCredentialService.getStoredPasswordHash(userId);

        // 2. Verify the current password before proceeding — core requirement.
        verifyCurrentPassword(currentPassword, storedHash);

        // 3. Delegate new-password validation, history check, hashing, and
        //    persistence to the credential service.
        userCredentialService.updatePassword(userId, newPassword);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    // -------------------------------------------------------------------------
    // Package-visible helpers (also exercised directly by unit tests)
    // -------------------------------------------------------------------------

    /**
     * Verify that {@code rawCurrentPassword} matches the {@code storedHash}.
     *
     * <p>This method is the single authoritative gate for current-password
     * verification.  It delegates the constant-time comparison to the injected
     * {@link PasswordHasher} so that the hashing algorithm can be swapped
     * (e.g. BCrypt → Argon2) without changing controller logic.
     *
     * @param rawCurrentPassword the plaintext password supplied by the user
     * @param storedHash         the BCrypt (or other) hash stored in the database
     * @throws InvalidCurrentPasswordException if the passwords do not match or
     *                                         either argument is {@code null}
     */
    void verifyCurrentPassword(String rawCurrentPassword, String storedHash) {
        if (rawCurrentPassword == null || storedHash == null) {
            throw new InvalidCurrentPasswordException(
                    "Current password and stored hash must not be null.");
        }

        boolean matches = passwordHasher.matches(rawCurrentPassword, storedHash);

        if (!matches) {
            throw new InvalidCurrentPasswordException();
        }
    }
}
