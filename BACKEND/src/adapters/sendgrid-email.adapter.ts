```typescript
import sgMail from '@sendgrid/mail';

export class SendGridEmailAdapter {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  async send(msg: sgMail.MailDataRequired) {
    await sgMail.send(msg);
  }
}
```