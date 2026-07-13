'use strict';

const UserService = require('../../src/application/userService');
const {
  ConflictError,
  UnauthorizedError,
  AccountNotVerifiedError,
  InvalidOtpError,
  NotFoundError,
} = require('../../src/domain/errors/domainErrors');

// ── Helpers ──────────────────────────────────────────────────────────────

function makeRepo(overrides = {}) {
  return {
    save: jest.fn(async (u) => u),
    findByEmail: jest.fn(async () => null),
    findById: jest.fn(async () => null),
    update: jest.fn(async (u) => u),
    deleteById: jest.fn(async () => {}),
    ...overrides,
  };
}

function makeEmailService() {
  return { sendOtp: jest.fn(async () => {}) };
}

// ── Registration ─────────────────────────────────────────────────────────

describe('UserService.register', () => {
  it('creates a new user and returns public representation', async () => {
    const repo = makeRepo();
    const email = makeEmailService();
    const svc = new UserService({ userRepository: repo, emailService: email });

    const result = await svc.register({
      email: 'alice@example.com',
      password: 'Password1!',
      firstName: 'Alice',
      lastName: 'Smith',
    });

    expect(result).toMatchObject({
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: false,
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictError when email already exists', async () => {
    const existingUser = {
      id: 'uuid-1',
      email: 'alice@example.com',
      passwordHash: 'hash',
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: false,
      otpCode: null,
      otpExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = makeRepo({ findByEmail: jest.fn(async () => existingUser) });
    const svc = new UserService({ userRepository: repo, emailService: makeEmailService() });

    await expect(
      svc.register({ email: 'alice@example.com', password: 'Password1!', firstName: 'Alice', lastName: 'Smith' })
    ).rejects.toThrow(ConflictError);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────

describe('UserService.login', () => {
  it('throws UnauthorizedError for unknown email', async () => {
    const svc = new UserService({ userRepository: makeRepo(), emailService: makeEmailService() });
    await expect(svc.login({ email: 'nobody@example.com', password: 'pass' })).rejects.toThrow(
      UnauthorizedError
    );
  });

  it('throws AccountNotVerifiedError when account is not verified', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('Password1!', 10);
    const user = {
      id: 'uuid-1',
      email: 'alice@example.com',
      passwordHash: hash,
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: false,
      otpCode: null,
      otpExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = makeRepo({ findByEmail: jest.fn(async () => user) });
    const svc = new UserService({ userRepository: repo, emailService: makeEmailService() });

    await expect(svc.login({ email: 'alice@example.com', password: 'Password1!' })).rejects.toThrow(
      AccountNotVerifiedError
    );
  });

  it('returns user when credentials are valid and account is verified', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('Password1!', 10);
    const user = {
      id: 'uuid-1',
      email: 'alice@example.com',
      passwordHash: hash,
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = makeRepo({ findByEmail: jest.fn(async () => user) });
    const svc = new UserService({ userRepository: repo, emailService: makeEmailService() });

    const result = await svc.login({ email: 'alice@example.com', password: 'Password1!' });
    expect(result.user).toMatchObject({ email: 'alice@example.com', isVerified: true });
  });
});

// ── OTP Verification ──────────────────────────────────────────────────────

describe('UserService.verifyOtp', () => {
  it('throws NotFoundError for unknown email', async () => {
    const svc = new UserService({ userRepository: makeRepo(), emailService: makeEmailService() });
    await expect(svc.verifyOtp({ email: 'nobody@example.com', otp: '123456' })).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws InvalidOtpError when OTP has expired', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123456', 10);
    const user = {
      id: 'uuid-1',
      email: 'alice@example.com',
      passwordHash: 'hash',
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: false,
      otpCode: hash,
      otpExpiresAt: new Date(Date.now() - 1000), // already expired
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = makeRepo({ findByEmail: jest.fn(async () => user) });
    const svc = new UserService({ userRepository: repo, emailService: makeEmailService() });

    await expect(svc.verifyOtp({ email: 'alice@example.com', otp: '123456' })).rejects.toThrow(
      InvalidOtpError
    );
  });

  it('marks user as verified on correct OTP', async () => {
    const bcrypt = require('bcrypt');
    const otp = '654321';
    const hash = await bcrypt.hash(otp, 10);
    const user = {
      id: 'uuid-1',
      email: 'alice@example.com',
      passwordHash: 'hash',
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: false,
      otpCode: hash,
      otpExpiresAt: new Date(Date.now() + 600_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = makeRepo({
      findByEmail: jest.fn(async () => user),
      update: jest.fn(async (u) => u),
    });
    const svc = new UserService({ userRepository: repo, emailService: makeEmailService() });

    const result = await svc.verifyOtp({ email: 'alice@example.com', otp });
    expect(result.isVerified).toBe(true);
    expect(repo.update).toHaveBeenCalledTimes(1);
  });
});

// ── Delete User ───────────────────────────────────────────────────────────

describe('UserService.deleteUser', () => {
  it('throws NotFoundError when user does not exist', async () => {
    const svc = new UserService({ userRepository: makeRepo(), emailService: makeEmailService() });
    await expect(svc.deleteUser('non-existent-id')).rejects.toThrow(NotFoundError);
  });

  it('calls deleteById when user exists', async () => {
    const user = {
      id: 'uuid-1',
      email: 'alice@example.com',
      passwordHash: 'hash',
      firstName: 'Alice',
      lastName: 'Smith',
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = makeRepo({ findById: jest.fn(async () => user) });
    const svc = new UserService({ userRepository: repo, emailService: makeEmailService() });

    await svc.deleteUser('uuid-1');
    expect(repo.deleteById).toHaveBeenCalledWith('uuid-1');
  });
});
