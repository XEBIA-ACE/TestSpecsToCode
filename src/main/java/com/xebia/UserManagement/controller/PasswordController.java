```java
package com.xebia.UserManagement.controller;

import com.xebia.UserManagement.service.RateLimiterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PasswordController {

    @Autowired
    private RateLimiterService rateLimiterService;

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestParam String userId, 
                                                 @RequestParam String currentPassword, 
                                                 @RequestParam String newPassword) {
        if (!rateLimiterService.isAllowed(userId)) {
            return ResponseEntity.status(429).body("Too many attempts. Please try again later.");
        }

        // ... additional logic to verify, change password, etc.

        return ResponseEntity.ok("Password changed successfully.");
    }
}
```