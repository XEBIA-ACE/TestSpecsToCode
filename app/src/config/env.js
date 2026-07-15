```javascript
'use strict';

const { z } = require('zod');

const envSchema = z.object({
  smtpHost: z.string(),
  smtpPort: z.number(),
  smtpSecure: z.boolean(),
  smtpUser: z.string(),
  smtpPass: z.string(),
  emailFrom: z.string(),
});

const env = {
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT, 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM,
};

const _env = envSchema.safeParse(env);

if (!_env.success) {
  console.error('Invalid environment variables', _env.error.format());
  process.exit(1);
}

module.exports = _env.data;
```