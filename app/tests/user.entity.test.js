'use strict';

const { createUser, toPublicUser } = require('../../src/domain/entities/user');

describe('createUser', () => {
  it('creates a user with correct defaults', () => {
    const user = createUser({
      email: '  Alice@Example.COM  ',
      passwordHash: 'hashed',
      firstName: '  Alice  ',
      lastName: 'Smith',
    });

    expect(user.email).toBe('alice@example.com');
    expect(user.firstName).toBe('Alice');
    expect(user.isVerified).toBe(false);
    expect(user.otpCode).toBeNull();
    expect(user.otpExpiresAt).toBeNull();
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('uses provided id when supplied', () => {
    const user = createUser({
      id: 'custom-id',
      email: 'bob@example.com',
      passwordHash: 'hash',
      firstName: 'Bob',
      lastName: 'Jones',
    });
    expect(user.id).toBe('custom-id');
  });
});

describe('toPublicUser', () => {
  it('omits passwordHash and OTP fields', () => {
    const user = createUser({
      email: 'carol@example.com',
      passwordHash: 'secret',
      firstName: 'Carol',
      lastName: 'White',
    });
    user.otpCode = 'otp-hash';
    user.otpExpiresAt = new Date();

    const pub = toPublicUser(user);
    expect(pub).not.toHaveProperty('passwordHash');
    expect(pub).not.toHaveProperty('otpCode');
    expect(pub).not.toHaveProperty('otpExpiresAt');
    expect(pub).toHaveProperty('email', 'carol@example.com');
    expect(pub).toHaveProperty('isVerified', false);
  });
});
