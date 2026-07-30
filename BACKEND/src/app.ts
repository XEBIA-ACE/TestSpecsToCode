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
    res.status(409).json({ errorCode: 'DUPLICATE_DISPATCH', message: err.message });
    return;
  }

  // Default error handler
  res.status(500).json({ errorCode: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
}

function emailVerificationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const user = req.user; // Assuming `req.user` is populated with authenticated user data
  if (!user.isVerified) {
    res.status(403).json({ error: 'Email not verified' });
  } else {
    next();
  }
}

export function createApp(db: Database, redisClient: Redis, otpDeliveryPort: OtpDeliveryPort, emailDeliveryPort: EmailDeliveryPort): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Middleware to restrict access to features for unverified emails
  app.use('/restricted-route', emailVerificationMiddleware);

  app.use('/api/v1/users', createRegistrationRouter(db, redisClient, otpDeliveryPort, emailDeliveryPort));
  app.use('/api/v1/activate', createActivationRouter(db, redisClient));
  app.use('/api/v1/admin', createAdminRouter(db));
  app.use('/api/v1/otp', createOtpRouter(db, otpDeliveryPort));
  app.use('/api/v1/auth', createAuthRouter(db, redisClient));
  app.use('/api/v1/password', createPasswordRouter(db, redisClient));
  app.use('/api/v1/delete', createDeletionRouter(db));
  app.use('/api/v1/profile', emailVerificationMiddleware, createUserProfileRouter(db));
  app.use('/api/v1/health', createHealthRouter());

  app.use(createAppErrorHandler);

  return app;
}
``` 

### Created new middleware for restricting access in unverified accounts

Note: Assume `req.user` is available for authenticated requests which comes from a preceding authentication middleware.