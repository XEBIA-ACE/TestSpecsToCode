```java
package com.example.usermanagement.service;

import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.security.BcryptPasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BcryptPasswordHasher passwordHasher;

    public String updatePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!passwordHasher.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        if (!isValidPassword(newPassword)) {
            throw new IllegalArgumentException("New password does not meet the complexity requirements");
        }
        
        user.setPassword(passwordHasher.hash(newPassword));
        userRepository.save(user);
        return "Password updated successfully";
    }

    private boolean isValidPassword(String password) {
        // Implement password complexity validation logic here
        return password.length() >= 8 && 
               password.chars().anyMatch(Character::isUpperCase) &&
               password.chars().anyMatch(Character::isLowerCase) &&
               password.chars().anyMatch(Character::isDigit) &&
               password.chars().anyMatch(c -> !Character.isLetterOrDigit(c));
    }
}
```