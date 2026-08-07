package com.usermanagement.password;

/**
 * Represents a single password policy violation with a machine-readable code
 * and a human-readable message suitable for display in the UI.
 */
public class PasswordPolicyViolation {

    private final String code;
    private final String message;

    public PasswordPolicyViolation(String code, String message) {
        this.code = code;
        this.message = message;
    }

    /** Short identifier for the rule that was violated (e.g. "MIN_LENGTH"). */
    public String getCode() {
        return code;
    }

    /** User-facing description of the violation. */
    public String getMessage() {
        return message;
    }

    @Override
    public String toString() {
        return "[" + code + "] " + message;
    }
}
