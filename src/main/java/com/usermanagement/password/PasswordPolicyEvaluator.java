package com.usermanagement.password;

import java.util.List;

/**
 * Contract for evaluating whether a candidate password satisfies the
 * application's password policy.
 *
 * <p>Implementations return a list of {@link PasswordPolicyViolation} objects
 * so that callers (controllers, UI feedback components) can surface precise,
 * actionable messages to the user rather than a single boolean pass/fail.
 */
public interface PasswordPolicyEvaluator {

    /**
     * Evaluate {@code newPassword} against all configured policy rules.
     *
     * @param newPassword the candidate password supplied by the user; must not be {@code null}
     * @return an unmodifiable list of violations; empty list means the password is compliant
     */
    List<PasswordPolicyViolation> evaluate(String newPassword);

    /**
     * Convenience method that returns {@code true} only when {@link #evaluate}
     * produces no violations.
     *
     * @param newPassword the candidate password
     * @return {@code true} if the password satisfies every policy rule
     */
    default boolean isValid(String newPassword) {
        return evaluate(newPassword).isEmpty();
    }
}
