```java
package com.example.usermanagement.controller;

import com.example.usermanagement.service.PasswordService;
import com.example.usermanagement.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
public class PasswordController {

    @Autowired
    private PasswordService passwordService;

    @PutMapping("/update")
    public String updatePassword(@RequestParam String userId, @RequestParam String currentPassword, @RequestParam String newPassword) {
        return passwordService.updatePassword(userId, currentPassword, newPassword);
    }
}
```