package com.usermanagement.controller;

import com.usermanagement.exception.InvalidCurrentPasswordException;
import com.usermanagement.hashing.PasswordHasher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link PasswordController#verifyCurrentPassword} and the
 * {@code /api/password/change} endpoint.
 *
 * Acceptance criteria verified:
 *  AC-1  Current password must be verified before allowing a password update.
 *  AC-2  Verification must integrate with the existing password hashes
 *        (i.e. delegate to {@link PasswordHasher#matches}).
 */
@ExtendWith(MockitoExtension.class)
class PasswordControllerTest {

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private UserCredentialService userCredentialService;

    private PasswordController controller;

    @BeforeEach
    void setUp() {
        controller = new PasswordController(passwordHasher, userCredentialService);
    }

    // -----------------------------------------------------------------------
    // verifyCurrentPassword — unit-level tests
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("AC-1 & AC-2: verifyCurrentPassword succeeds when hasher confirms a match")
    void verifyCurrentPassword_matchingPassword_doesNotThrow() {
        // Arrange
        String raw  = "S3cur3P@ss!";
        String hash = "$2a$10$storedHashValue";
        when(passwordHasher.matches(raw, hash)).thenReturn(true);

        // Act & Assert — no exception expected
        assertThatCode(() -> controller.verifyCurrentPassword(raw, hash))
                .doesNotThrowAnyException();

        // AC-2: the hasher must have been consulted
        verify(passwordHasher).matches(raw, hash);
    }

    @Test
    @DisplayName("AC-1: verifyCurrentPassword throws when hasher reports a mismatch")
    void verifyCurrentPassword_wrongPassword_throwsInvalidCurrentPasswordException() {
        // Arrange
        String raw  = "WrongP@ss1";
        String hash = "$2a$10$storedHashValue";
        when(passwordHasher.matches(raw, hash)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> controller.verifyCurrentPassword(raw, hash))
                .isInstanceOf(InvalidCurrentPasswordException.class);
    }

    @Test
    @DisplayName("AC-1: verifyCurrentPassword throws when rawCurrentPassword is null")
    void verifyCurrentPassword_nullRaw_throwsInvalidCurrentPasswordException() {
        assertThatThrownBy(() -> controller.verifyCurrentPassword(null, "$2a$10$hash"))
                .isInstanceOf(InvalidCurrentPasswordException.class);

        // Hasher must NOT be called with null input
        verifyNoInteractions(passwordHasher);
    }

    @Test
    @DisplayName("AC-1: verifyCurrentPassword throws when storedHash is null")
    void verifyCurrentPassword_nullHash_throwsInvalidCurrentPasswordException() {
        assertThatThrownBy(() -> controller.verifyCurrentPassword("somePassword", null))
                .isInstanceOf(InvalidCurrentPasswordException.class);

        verifyNoInteractions(passwordHasher);
    }

    // -----------------------------------------------------------------------
    // changePassword endpoint — integration-style unit tests
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("AC-1: changePassword calls verifyCurrentPassword before updatePassword")
    void changePassword_correctCurrentPassword_updatesPassword() {
        // Arrange
        String userId   = "user-42";
        String current  = "OldP@ss1";
        String newPass  = "NewP@ss2!";
        String stored   = "$2a$10$storedHash";

        when(userCredentialService.getStoredPasswordHash(userId)).thenReturn(stored);
        when(passwordHasher.matches(current, stored)).thenReturn(true);

        Map<String, String> body = Map.of(
                "userId",          userId,
                "currentPassword", current,
                "newPassword",     newPass
        );

        // Act
        ResponseEntity<Map<String, String>> response = controller.changePassword(body);

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);

        // Verification must happen before the update
        InOrder order = inOrder(passwordHasher, userCredentialService);
        order.verify(passwordHasher).matches(current, stored);
        order.verify(userCredentialService).updatePassword(userId, newPass);
    }

    @Test
    @DisplayName("AC-1: changePassword rejects request when current password is wrong")
    void changePassword_wrongCurrentPassword_throwsAndDoesNotUpdate() {
        // Arrange
        String userId  = "user-42";
        String current = "WrongP@ss";
        String stored  = "$2a$10$storedHash";

        when(userCredentialService.getStoredPasswordHash(userId)).thenReturn(stored);
        when(passwordHasher.matches(current, stored)).thenReturn(false);

        Map<String, String> body = Map.of(
                "userId",          userId,
                "currentPassword", current,
                "newPassword",     "NewP@ss2!"
        );

        // Act & Assert
        assertThatThrownBy(() -> controller.changePassword(body))
                .isInstanceOf(InvalidCurrentPasswordException.class);

        // updatePassword must NOT be called when verification fails
        verify(userCredentialService, never()).updatePassword(anyString(), anyString());
    }

    @Test
    @DisplayName("AC-2: changePassword delegates hash comparison to PasswordHasher")
    void changePassword_delegatesHashComparisonToPasswordHasher() {
        // Arrange
        String userId  = "user-99";
        String current = "P@ssw0rd!";
        String stored  = "$2a$10$differentHash";

        when(userCredentialService.getStoredPasswordHash(userId)).thenReturn(stored);
        when(passwordHasher.matches(current, stored)).thenReturn(true);

        Map<String, String> body = Map.of(
                "userId",          userId,
                "currentPassword", current,
                "newPassword",     "N3wP@ss!"
        );

        controller.changePassword(body);

        // AC-2: the existing hashing strategy (PasswordHasher) must be used
        verify(passwordHasher, times(1)).matches(current, stored);
    }
}
