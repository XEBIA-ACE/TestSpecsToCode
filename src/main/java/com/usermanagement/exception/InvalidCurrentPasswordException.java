package com.usermanagement.exception;

/**
 * Thrown when the current (old) password supplied by the user does not match
 * the stored hash during a password-change request.
 */
public class InvalidCurrentPasswordException extends RuntimeException {

    public InvalidCurrentPasswordException() {
        super("The current password provided is incorrect.");
    }

    public InvalidCurrentPasswordException(String message) {
        super(message);
    }
}
