package com.usermanagement.password;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link DefaultPasswordPolicyEvaluator}.
 *
 * Coverage targets (per constitution.md): >80 % line/branch coverage.
 * Each acceptance criterion from tasks.md is mapped to at least one test.
 */
class DefaultPasswordPolicyEvaluatorTest {

    private DefaultPasswordPolicyEvaluator evaluator;

    @BeforeEach
    void setUp() {
        evaluator = new DefaultPasswordPolicyEvaluator();
    }

    // -----------------------------------------------------------------------
    // Happy-path: fully compliant password
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Compliant password produces no violations")
    void compliantPassword_noViolations() {
        // 8+ chars, upper, lower, digit, special
        List<PasswordPolicyViolation> violations = evaluator.evaluate("Secure1!");
        assertTrue(violations.isEmpty(), "Expected no violations for a compliant password");
    }

    @Test
    @DisplayName("isValid returns true for a compliant password")
    void isValid_trueForCompliantPassword() {
        assertTrue(evaluator.isValid("Secure1!"));
    }

    // -----------------------------------------------------------------------
    // Null / empty guard
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Null password triggers NULL_OR_EMPTY violation")
    void nullPassword_triggersNullOrEmptyViolation() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate(null);
        assertEquals(1, violations.size());
        assertEquals(DefaultPasswordPolicyEvaluator.CODE_NULL_OR_EMPTY, violations.get(0).getCode());
    }

    @Test
    @DisplayName("Empty password triggers NULL_OR_EMPTY violation")
    void emptyPassword_triggersNullOrEmptyViolation() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("");
        assertEquals(1, violations.size());
        assertEquals(DefaultPasswordPolicyEvaluator.CODE_NULL_OR_EMPTY, violations.get(0).getCode());
    }

    // -----------------------------------------------------------------------
    // Minimum length rule
    // -----------------------------------------------------------------------

    @ParameterizedTest(name = "Password \"{0}\" is too short")
    @ValueSource(strings = {"Ab1!", "Ab1!xyz"}) // 4 chars and 7 chars
    @DisplayName("Passwords shorter than 8 characters trigger MIN_LENGTH violation")
    void shortPassword_triggersMinLengthViolation(String password) {
        List<PasswordPolicyViolation> violations = evaluator.evaluate(password);
        assertTrue(
                violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_MIN_LENGTH.equals(v.getCode())),
                "Expected MIN_LENGTH violation for password: " + password);
    }

    @Test
    @DisplayName("Password of exactly 8 characters does not trigger MIN_LENGTH violation")
    void exactlyMinLength_noMinLengthViolation() {
        // Exactly 8 chars, all rules satisfied
        List<PasswordPolicyViolation> violations = evaluator.evaluate("Secure1!");
        assertFalse(
                violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_MIN_LENGTH.equals(v.getCode())),
                "Should not trigger MIN_LENGTH for an 8-character password");
    }

    // -----------------------------------------------------------------------
    // Uppercase rule
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Password without uppercase triggers REQUIRES_UPPERCASE violation")
    void noUppercase_triggersViolation() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("secure1!");
        assertTrue(
                violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_UPPERCASE.equals(v.getCode())));
    }

    @Test
    @DisplayName("Violation message for missing uppercase is user-friendly")
    void noUppercase_violationMessageIsUserFriendly() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("secure1!");
        String msg = violations.stream()
                .filter(v -> DefaultPasswordPolicyEvaluator.CODE_UPPERCASE.equals(v.getCode()))
                .findFirst()
                .map(PasswordPolicyViolation::getMessage)
                .orElse("");
        assertFalse(msg.isBlank(), "Violation message must not be blank");
    }

    // -----------------------------------------------------------------------
    // Lowercase rule
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Password without lowercase triggers REQUIRES_LOWERCASE violation")
    void noLowercase_triggersViolation() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("SECURE1!");
        assertTrue(
                violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_LOWERCASE.equals(v.getCode())));
    }

    // -----------------------------------------------------------------------
    // Digit rule
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Password without digit triggers REQUIRES_DIGIT violation")
    void noDigit_triggersViolation() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("Secure!!");
        assertTrue(
                violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_DIGIT.equals(v.getCode())));
    }

    // -----------------------------------------------------------------------
    // Special character rule
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Password without special character triggers REQUIRES_SPECIAL_CHARACTER violation")
    void noSpecialChar_triggersViolation() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("Secure12");
        assertTrue(
                violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_SPECIAL.equals(v.getCode())));
    }

    // -----------------------------------------------------------------------
    // Multiple simultaneous violations
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("All rules violated simultaneously returns all violation codes")
    void allRulesViolated_returnsAllViolations() {
        // "abc" — too short, no upper, no digit, no special
        List<PasswordPolicyViolation> violations = evaluator.evaluate("abc");
        assertTrue(violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_MIN_LENGTH.equals(v.getCode())));
        assertTrue(violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_UPPERCASE.equals(v.getCode())));
        assertTrue(violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_DIGIT.equals(v.getCode())));
        assertTrue(violations.stream().anyMatch(v -> DefaultPasswordPolicyEvaluator.CODE_SPECIAL.equals(v.getCode())));
    }

    @Test
    @DisplayName("Returned violation list is unmodifiable")
    void returnedList_isUnmodifiable() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("weak");
        assertThrows(UnsupportedOperationException.class, () -> violations.add(
                new PasswordPolicyViolation("X", "x")));
    }

    // -----------------------------------------------------------------------
    // Feedback content (acceptance criterion: feedback is provided on violations)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Every violation carries a non-blank message for UI feedback")
    void everyViolation_hasNonBlankMessage() {
        // Password that triggers all rules
        List<PasswordPolicyViolation> violations = evaluator.evaluate("abc");
        assertFalse(violations.isEmpty());
        for (PasswordPolicyViolation v : violations) {
            assertFalse(v.getMessage() == null || v.getMessage().isBlank(),
                    "Violation " + v.getCode() + " must have a non-blank message");
        }
    }

    @Test
    @DisplayName("Every violation carries a non-blank code")
    void everyViolation_hasNonBlankCode() {
        List<PasswordPolicyViolation> violations = evaluator.evaluate("abc");
        for (PasswordPolicyViolation v : violations) {
            assertFalse(v.getCode() == null || v.getCode().isBlank(),
                    "Violation must have a non-blank code");
        }
    }
}
