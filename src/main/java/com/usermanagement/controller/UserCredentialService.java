package com.usermanagement.controller;

/**
 * Service contract for user-credential operations.
 *
 * Implementations are responsible for:
 * <ul>
 *   <li>Retrieving the stored password hash for a given user.</li>
 *   <li>Validating new-password complexity (delegating to
 *       {@code DefaultPasswordPolicyEvaluator}).</li>
 *   <li>Checking password history to prevent reuse of the last 5 passwords.</li>
 *   <li>Hashing the new password via {@code BcryptPasswordHasher} and persisting it.</li>
 *   <li>Invalidating all active sessions after a successful change.</li>
 *   <li>Sending an email confirmation.</li>
 * </ul>
 *
 * This interface is defined here so that {@link PasswordController} can be
 * compiled and unit-tested independently of the full service implementation.
 */
public interface UserCredentialService {

    /**
     * Return the BCrypt (or equivalent) hash currently stored for {@code userId}.
     *
     * @param userId the account identifier
     * @return the stored password hash; never {@code null}
     * @throws IllegalArgumentException if {@code userId} is unknown
     */
    String getStoredPasswordHash(String userId);

    /**
     * Validate, hash, and persist {@code newRawPassword} for {@code userId}.
     *
     * <p>Implementations must:
     * <ol>
     *   <li>Evaluate complexity via {@code DefaultPasswordPolicyEvaluator}.</li>
     *   <li>Check the last-5-passwords history.</li>
     *   <li>Hash with {@code BcryptPasswordHasher} and save.</li>
     *   <li>Invalidate all active sessions for the user.</li>
     *   <li>Dispatch a confirmation email.</li>
     * </ol>
     *
     * @param userId         the account identifier
     * @param newRawPassword the new plaintext password (pre-validation)
     */
    void updatePassword(String userId, String newRawPassword);
}
