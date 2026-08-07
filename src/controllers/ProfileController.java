```java
package src.controllers;

import src.integration.EmailNotificationService;
import src.models.User;
import src.services.UserService;
import javax.servlet.*;
import javax.servlet.http.*;

public class ProfileController extends HttpServlet {

    private UserService userService = new UserService();
    private EmailNotificationService emailService = new EmailNotificationService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String userId = request.getParameter("user_id");
        String newName = request.getParameter("new_name");

        User user = userService.getUserById(userId);

        if (user != null && isValidName(newName)) {
            userService.updateUserName(userId, newName);
            emailService.sendNameChangeConfirmation(user.getEmail(), user.getName());
            response.getWriter().write("Name change successful and email notification sent.");
        } else {
            response.getWriter().write("Name change failed.");
        }
    }

    private boolean isValidName(String name) {
        // Implement validation logic for name (e.g., length, allowed characters)
        return name != null && name.length() >= 2 && name.length() <= 100; // Example check
    }
}
```