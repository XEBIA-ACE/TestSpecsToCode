```java
package src.integration;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

public class EmailNotificationService {

    private final String fromEmail = "no-reply@example.com";
    private final String smtpHost = "smtp.example.com"; // Update with actual SMTP host
    private final String smtpPort = "587"; // or "25", depending on the email server configuration
    private final String smtpUsername = "smtp_username"; // Update with credentials
    private final String smtpPassword = "smtp_password"; // Update with credentials

    public void sendNameChangeConfirmation(String toEmail, String userName) {
        String subject = "Name Change Confirmation";
        String body = "Dear " + userName + ",\n\nYour name has been successfully updated.\n\nBest regards,\nYour Company";

        Properties props = new Properties();
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", smtpPort);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(smtpUsername, smtpPassword);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);
            message.setText(body);

            Transport.send(message);
            System.out.println("Email sent successfully to " + toEmail);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
```