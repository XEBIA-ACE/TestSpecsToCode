```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import type { Database } from 'better-sqlite3';
import { Redis } from 'ioredis';
import { createRegistrationRouter } from './routes/registration.routes';
import { createActivationRouter } from './routes/activation.routes';
import { createAdminRouter } from './routes/admin.routes';
import { createOtpRouter } from './routes/otp.routes';
import { createAuthRouter } from './routes/auth.routes';
import { createPasswordRouter } from './routes/password.routes';
import { createDeletionRouter } from './routes/deletion.routes';
import { createUserProfileRouter } from './routes/user-profile.routes';
import { createHealthRouter } from './routes/health.routes';
import { OtpDeliveryPort } from './adapters/otp-delivery.port';
import { EmailDeliveryPort } from './adapters/email-delivery.port';
import { UserRepository } from './repositories/user.repository';
import { SessionRepository } from './repositories/session.repository';
import { DefaultSessionService } from './services/session.service';
import {
  ValidationError,
  UsernameConflictError,
  TokenNotFoundException,
  TokenExpiredException,
  TokenConsumedException,
  AccountNotPendingException,
  DuplicateDispatchException,
  UserNotFoundException,
} from './errors/registration.errors';
import {
  InvalidCredentialsException,
  AccountNotActiveException,
  AccountLockedException,
  SessionCreationFailedException,
  SessionNotFoundException,
  SessionExpiredException,
  SessionInvalidatedException,
  PasswordPolicyViolationException,
} from './errors/login.errors';
import {
  DeletionRequestAlreadyPendingException,
  DeletionRequestNotFoundException,
} from './errors/account-deletion.errors';
import { validateProfile } from './middleware/validation.middleware';

function createAppErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ValidationError) {
    res.status(422).json({ errorCode: err.code, message: err.message });
    return;
  }

  if (err instanceof UsernameConflictError) {
    res.status(409).json({ errorCode: 'USERNAME_CONFLICT', message: err.message });
    return;
  }

  if (err instanceof TokenNotFoundException) {
    res.status(404).json({ errorCode: 'TOKEN_NOT_FOUND', message: err.message });
    return;
  }

  if (err instanceof TokenExpiredException) {
    res.status(410).json({ errorCode: 'TOKEN_EXPIRED', message: err.message });
    return;
  }

  if (err instanceof TokenConsumedException) {
    res.status(410).json({ errorCode: 'TOKEN_CONSUMED', message: err.message });
    return;
  }

  if (err instanceof AccountNotPendingException) {
    res.status(409).json({ errorCode: 'ACCOUNT_NOT_PENDING', message: err.message });
    return;
  }

  if (err instanceof DuplicateDispatchException) {
    res.status(409).json({ errorCode: 'DUPLICATE_DISPATCH', message: 'Duplicate dispatch request' });
    return;
  }

  res.status(500).json({ errorCode: 'INTERNAL_ERROR', message: 'An unknown error occurred' });
}

export function createApp(db: Database, redisClient: Redis, otpDeliveryPort: OtpDeliveryPort, emailDeliveryPort: EmailDeliveryPort) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Attach validation middleware to profile-related routes
  app.use('/api/v1/users/profiles', validateProfile);

  // Set up routes
  app.use('/api/v1/users', createUserProfileRouter(db));

  // Error handling middleware
  app.use(createAppErrorHandler);
  
  return app;
}
```