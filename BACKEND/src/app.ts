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
// SSO-specific error import — SsoAuthenticationException is thrown by the SSO
// service when OAuth token validation fails or the user has no linked identity.
import { SsoAuthenticationException } from './errors/sso.errors';

/**
 * Centralized error handler.
 *
 * Rules (per constitution.md and spec US-001):
 *  - SSO failures must surface a generic, non-revealing message.
 *  - Legacy login failures retain their existing error codes/messages.
 *  - No provider-specific or field-specific detail is ever leaked to the client.
 */
function createAppErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err);
  }

  // ── Registration errors ───────────────────────────────────────────────────

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

  if (err instanceof UserNotFoundException) {
    res.status(404).json({ errorCode: 'USER_NOT_FOUND', message: err.message });
    return;
  }

  // ── Legacy login errors ───────────────────────────────────────────────────
  // These are intentionally retained unchanged so existing login flows are
  // unaffected (AC: "legacy login error handling is unaffected").

  if (err instanceof InvalidCredentialsException) {
    res.status(401).json({ errorCode: 'INVALID_CREDENTIALS', message: err.message });
    return;
  }

  if (err instanceof AccountNotActiveException) {
    res.status(403).json({ errorCode: 'ACCOUNT_NOT_ACTIVE', message: err.message });
    return;
  }

  if (err instanceof AccountLockedException) {
    res.status(403).json({ errorCode: 'ACCOUNT_LOCKED', message: err.message });
    return;
  }

  if (err instanceof SessionCreationFailedException) {
    res.status(500).json({ errorCode: 'SESSION_CREATION_FAILED', message: 'Authentication failed. Please try again.' });
    return;
  }

  if (err instanceof SessionNotFoundException) {
    res.status(404).json({ errorCode: 'SESSION_NOT_FOUND', message: err.message });
    return;
  }

  if (err instanceof SessionExpiredException) {
    res.status(401).json({ errorCode: 'SESSION_EXPIRED', message: err.message });
    return;
  }

  if (err instanceof SessionInvalidatedException) {
    res.status(401).json({ errorCode: 'SESSION_INVALIDATED', message: err.message });
    return;
  }

  if (err instanceof PasswordPolicyViolationException) {
    res.status(422).json({ errorCode: 'PASSWORD_POLICY_VIOLATION', message: err.message });
    return;
  }

  // ── Account deletion errors ───────────────────────────────────────────────

  if (err instanceof DeletionRequestAlreadyPendingException) {
    res.status(409).json({ errorCode: 'DELETION_REQUEST_ALREADY_PENDING', message: err.message });
    return;
  }

  if (err instanceof DeletionRequestNotFoundException) {
    res.status(404).json({ errorCode: 'DELETION_REQUEST_NOT_FOUND', message: err.message });
    return;
  }

  // ── SSO errors ────────────────────────────────────────────────────────────
  // Per spec US-001 AC-2 and constitution.md: SSO failures must always return
  // a generic, non-revealing message. Provider-specific details must never be
  // surfaced to the client (no logging of OAuth tokens either).
  if (err instanceof SsoAuthenticationException) {
    res.status(401).json({
      errorCode: 'SSO_AUTHENTICATION_FAILED',
      message: 'Authentication failed. Please try again.',
    });
    return;
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  const status =
    (err as { statusCode?: number; status?: number }).statusCode ||
    (err as { statusCode?: number; status?: number }).status ||
    500;
  const message =
    status < 500
      ? (err as Error).message || 'An error occurred.'
      : 'Internal Server Error';

  res.status(status).json({ errorCode: 'INTERNAL_ERROR', message });
}

export function createApp(
  db: Database,
  redisClient: Redis,
  otpDeliveryPort: OtpDeliveryPort,
  emailDeliveryPort: EmailDeliveryPort,
): express.Application {
  const app = express();

  // ── Security & parsing middleware ─────────────────────────────────────────
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // ── Swagger / OpenAPI docs ────────────────────────────────────────────────
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch {
    // OpenAPI spec file is optional in development; skip if missing.
  }

  // ── Shared dependencies ───────────────────────────────────────────────────
  const userRepository = new UserRepository(db);
  const sessionRepository = new SessionRepository(db);
  const sessionService = new DefaultSessionService(sessionRepository);

  // ── Route registration ────────────────────────────────────────────────────

  // Health check (no auth required)
  app.use('/api/v1/health', createHealthRouter());

  // Registration & activation
  app.use('/api/v1/auth', createRegistrationRouter(db, emailDeliveryPort));
  app.use('/api/v1/auth', createActivationRouter(db, emailDeliveryPort));

  // OTP (one-time password flows)
  app.use('/api/v1/auth', createOtpRouter(db, redisClient, otpDeliveryPort));

  // Legacy login (email/mobile + password) — MUST remain registered and
  // unaffected by the SSO addition (AC: "legacy login flows are retained").
  app.use('/api/v1/auth', createAuthRouter(db, sessionService));

  // Password management
  app.use('/api/v1/auth', createPasswordRouter(db, emailDeliveryPort));

  // ── SSO route registration ────────────────────────────────────────────────
  // The SSO sign-in endpoint lives in auth.routes.ts alongside the legacy
  // login route. createAuthRouter already exposes it if the route file exports
  // it; no separate router factory is required. If a dedicated SSO router
  // factory is introduced in a future task, mount it here:
  //
  //   import { createSsoRouter } from './routes/sso.routes';
  //   app.use('/api/v1/auth', createSsoRouter(db, sessionService));
  //
  // The SSO endpoint (/api/v1/auth/sso/callback or /api/v1/auth/sso/sign-in)
  // is already included via createAuthRouter above, which was updated in the
  // preceding task to add the SSO handler. Any SsoAuthenticationException
  // thrown there is caught by the centralized error handler below.

  // User profile & admin (protected routes)
  app.use('/api/v1/users', createUserProfileRouter(db, sessionService));
  app.use('/api/v1/admin', createAdminRouter(db));

  // Account deletion
  app.use('/api/v1/users', createDeletionRouter(db, emailDeliveryPort));

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ errorCode: 'NOT_FOUND', message: 'Resource not found.' });
  });

  // ── Centralized error handler ─────────────────────────────────────────────
  // Must be the LAST middleware registered. Handles errors from ALL routes
  // including both SSO and legacy login, ensuring consistent, non-revealing
  // responses (see createAppErrorHandler above).
  app.use(createAppErrorHandler);

  return app;
}
