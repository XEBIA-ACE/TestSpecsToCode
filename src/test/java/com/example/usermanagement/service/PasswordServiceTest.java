```java
package com.example.usermanagement.service;

import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.security.BcryptPasswordHasher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BcryptPasswordHasher passwordHasher;

    @InjectMocks
    private PasswordService passwordService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testUpdatePassword_Success() {
        User user = new User();
        user.setId("1");
        user.setPassword("oldPasswordHash");

        when(userRepository.findById("1")).thenReturn(java.util.Optional.of(user));
        when(passwordHasher.matches("oldPassword", "oldPasswordHash")).thenReturn(true);
        when(passwordHasher.hash("newPassword")).thenReturn("newPasswordHash");

        String result = passwordService.updatePassword("1", "oldPassword", "newPassword");

        assertEquals("Password updated successfully", result);
        verify(userRepository).save(user);
        assertEquals("newPasswordHash", user.getPassword());
    }

    @Test
    public void testUpdatePassword_InvalidCurrentPassword() {
        User user = new User();
        user.setId("1");
        user.setPassword("oldPasswordHash");

        when(userRepository.findById("1")).thenReturn(java.util.Optional.of(user));
        when(passwordHasher.matches("wrongPassword", "oldPasswordHash")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () ->
            passwordService.updatePassword("1", "wrongPassword", "newPassword")
        );
    }

    @Test
    public void testUpdatePassword_InvalidNewPassword() {
        User user = new User();
        user.setId("1");
        user.setPassword("oldPasswordHash");

        when(userRepository.findById("1")).thenReturn(java.util.Optional.of(user));
        when(passwordHasher.matches("oldPassword", "oldPasswordHash")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
            passwordService.updatePassword("1", "oldPassword", "short")
        );
    }
}
```