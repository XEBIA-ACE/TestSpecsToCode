```typescript
import 'dotenv/config';
import { Redis } from 'ioredis';
import { createApp } from './app';
import { createDb } from './db/connection';
import { runMigrations } from './db/migrate';
import { EmailRecordRepository } from './repositories/email-record.repository';
import { TokenRepository } from './repositories/token.repository';
import { UserRepository } from './repositories/user.repository';
import { DeletionNotificationRecordRepository } from './repositories/deletion-notification-record.repository';
import { SendGridEmailAdapter } from './adapters/sendgrid-email.adapter';
import { EmailOtpDeliveryAdapter } from './adapters/email-otp-delivery.adapter';
import { OutboxWorker } from './workers/outbox.worker';
import { AccountDeletionNotificationWorker } from './workers/account-deletion-notification.worker';
import { otpConfig } from './config/otp.config';

// Database and migrations setup
const db = createDb();
runMigrations(db);

// Redis and email setup
const otpRedisClient = new Redis(otpConfig.redisUrl);
const emailDeliveryPort = new SendGridEmailAdapter();
const otpDeliveryPort = new EmailOtpDeliveryAdapter(emailDeliveryPort);

// Application and repository instantiation
const app = createApp(db, otpRedisClient, otpDeliveryPort, emailDeliveryPort);
const emailRecordRepository = new EmailRecordRepository(db);
const tokenRepository = new TokenRepository(db);
const userRepository = new UserRepository(db);

const outboxWorker = new OutboxWorker(
  emailRecordRepository,
  tokenRepository,
  userRepository,
  emailDeliveryPort,
);
const deletionNotificationRecordRepository = new DeletionNotificationRecordRepository(db);
const accountDeletionNotificationWorker = new AccountDeletionNotificationWorker(
  deletionNotificationRecordRepository,
  emailDeliveryPort,
);

// Workers setup
outboxWorker.start();
accountDeletionNotificationWorker.start();

// Server setup
const port = parseInt(process.env.PORT ?? '3000', 10);
const server = app.listen(port, () => {
  console.log(`User Management Service listening on port ${port}`);
});

// Graceful shutdown
function shutdown(): void {
  console.log('Shutting down gracefully...');
  outboxWorker.stop();
  accountDeletionNotificationWorker.stop();
  server.close(() => {
    db.close();
    otpRedisClient.quit().then(() => {
      console.log('Shutdown complete.');
      process.exit(0);
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export {};
```