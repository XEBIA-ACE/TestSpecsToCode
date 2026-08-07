```java
package src.services;

import src.models.User;
import java.sql.*;

public class UserService {

    public User getUserById(String userId) {
        // Database connection and retrieval logic
        // For demonstration purposes, a mock User is returned
        return new User(userId, "example@example.com", "John Doe");
    }

    public void updateUserName(String userId, String newName) {
        // Database logic to update user name
        System.out.println("Updating name for user ID: " + userId + " to new name: " + newName);
    }
}
```