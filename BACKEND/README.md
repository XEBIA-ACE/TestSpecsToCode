# Email Verification Setup and Usage

This documentation provides details on how to set up and use the email verification feature in the application.

## Setup Instructions

1. **Environment Variables**:
   - Ensure that the environment variables are correctly set in the `.env` file.
   - Include the `SENDGRID_API_KEY` variable with the appropriate API key from your SendGrid account.

2. **Database Configuration**:
   - The database now includes a field to store email verification tokens. Ensure that the latest migrations are applied to include this field.
   - Run the migration command to update your database:
     ```bash
     npm run migrate
     ```

3. **Sending Verification Emails**:
   - The script located in `BACKEND/scripts/test-sendgrid.ts` is responsible for sending verification emails.
   - This script uses the SendGrid service to send out emails and must be configured with a verified sender email address.

4. **Verification Links**:
   - Upon registration, users will receive an email containing a verification link.
   - Clicking this verification link will activate the user's account by updating the verification status in the database.

## Usage

- When a user registers an account, the server sends a verification email using SendGrid.
- The verification email contains a unique link to verify the user's email address.
- Users must click the verification link to activate their accounts fully.
- Access to certain features is restricted until email verification is completed.
- Unverified users attempting to access restricted services will be prompted to verify their email addresses.

## Developer Notes

- Developers should ensure the SendGrid API Key is correctly configured in the environment.
- The verification status should be checked in the middleware before granting access to critical routes.
- Further customization of email templates should be done within the SendGrid dashboard as this is out of the scope of this documentation.

By following the setup instructions and usage details outlined above, you can successfully integrate and utilize the email verification feature in your application.