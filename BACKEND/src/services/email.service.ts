import sgMail from '@sendgrid/mail';

gsgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  static async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      await sgMail.send(payload);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
