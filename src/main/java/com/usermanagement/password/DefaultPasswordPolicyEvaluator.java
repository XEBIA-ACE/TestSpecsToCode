package com.usermanagement.password;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Default implementation of {@link PasswordPolicyEvaluator} that enforces the
 * complexity requirements defined in the Change Account Password specification:
 *
 * <ul>
 *   <li>Minimum 8 characters</li>
 *   <li>At least one uppercase letter (A-Z)</li>
 *   <li>At least one lowercase letter (a-z)</li>
 *   <li>At least one digit (0-9)</li>
 *   <li>At least one special character (!@#$%^&amp;*…)</li>
 * </ul>
 *
 * <p>Each violated rule produces a {@link PasswordPolicyViolation} with a
 * stable {@code code} (suitable for i18n key lookup) and a default English
 * message for immediate UI feedback.
 *
 * <p>This class is intentionally stateless and thread-safe.
 */
public class DefaultPasswordPolicyEvaluator implements PasswordPolicyEvaluator {

    // -----------------------------------------------------------------------
    // Policy constants — adjust here if requirements change
    // -----------------------------------------------------------------------

    /** Minimum number of characters required. */
    public static final int MIN_LENGTH = 8;

    // Pre-compiled patterns for performance (thread-safe after construction)
    private static final Pattern UPPERCASE_PATTERN  = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN  = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN      = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_PATTERN    = Pattern.compile("[^A-Za-z0-9]");

    // -----------------------------------------------------------------------
    // Violation codes — stable identifiers for i18n / client-side mapping
    // -----------------------------------------------------------------------

    public static final String CODE_NULL_OR_EMPTY = "NULL_OR_EMPTY";
    public static final String CODE_MIN_LENGTH    = "MIN_LENGTH";
    public static final String CODE_UPPERCASE     = "REQUIRES_UPPERCASE";
    public static final String CODE_LOWERCASE     = "REQUIRES_LOWERCASE";
    public static final String CODE_DIGIT         = "REQUIRES_DIGIT";
    public static final String CODE_SPECIAL       = "REQUIRES_SPECIAL_CHARACTER";

    // -----------------------------------------------------------------------
    // PasswordPolicyEvaluator implementation
    // -----------------------------------------------------------------------

    /**
     * {@inheritDoc}
     *
     * <p>All rules are evaluated independently so that the caller receives
     * the complete set of violations in a single call — enabling the UI to
     * display all feedback at once rather than one error at a time.
     *
     * @param newPassword the candidate password; {@code null} is treated as
     *                    an empty string and triggers a {@code NULL_OR_EMPTY} violation
     * @return unmodifiable list of violations; empty when the password is compliant
     */
    @Override
    public List<PasswordPolicyViolation> evaluate(String newPassword) {
        List<PasswordPolicyViolation> violations = new ArrayList<>();

        // Guard: null / blank password
        if (newPassword == null || newPassword.isEmpty()) {
            violations.add(new PasswordPolicyViolation(
                    CODE_NULL_OR_EMPTY,
                    "Password must not be empty."));
            // No point running further checks on an empty value
            return Collections.unmodifiableList(violations);
        }

        // Rule 1 — minimum length
        if (newPassword.length() < MIN_LENGTH) {
            violations.add(new PasswordPolicyViolation(
                    CODE_MIN_LENGTH,
                    "Password must be at least " + MIN_LENGTH + " characters long."));
        }

        // Rule 2 — at least one uppercase letter
        if (!UPPERCASE_PATTERN.matcher(newPassword).find()) {
            violations.add(new PasswordPolicyViolation(
                    CODE_UPPERCASE,
                    "Password must contain at least one uppercase letter (A-Z)."));
        }

        // Rule 3 — at least one lowercase letter
        if (!LOWERCASE_PATTERN.matcher(newPassword).find()) {
            violations.add(new PasswordPolicyViolation(
                    CODE_LOWERCASE,
                    "Password must contain at least one lowercase letter (a-z)."));
        }

        // Rule 4 — at least one digit
        if (!DIGIT_PATTERN.matcher(newPassword).find()) {
            violations.add(new PasswordPolicyViolation(
                    CODE_DIGIT,
                    "Password must contain at least one digit (0-9)."));
        }

        // Rule 5 — at least one special character
        if (!SPECIAL_PATTERN.matcher(newPassword).find()) {
            violations.add(new PasswordPolicyViolation(
                    CODE_SPECIAL,
                    "Password must contain at least one special character (e.g. !@#$%^&*)."));
        }

        return Collections.unmodifiableList(violations);
    }
}
