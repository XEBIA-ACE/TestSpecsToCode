'use strict';

const User = require('../src/domain/entities/user');

describe('User entity', () => {
  it('creates a user with default values', () => {
    const user = new User({ name: 'Alice', email: 'Alice@Example.com', passwordHash: 'hash' });
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Alice');
    // email is normalised to lowercase
    expect(user.email).toBe('alice@example.com');
    expect(user.isVerified).toBe(false);
    expect(user.isDeleted).toBe(false);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('toPublic() omits passwordHash', () => {
    const user = new User({ name: 'Bob', email: 'bob@example.com', passwordHash: 'secret' });
    const pub = user.toPublic();
    expect(pub.passwordHash).toBeUndefined();
    expect(pub.id).toBeDefined();
    expect(pub.email).toBe('bob@example.com');
  });

  it('fromRow() maps snake_case DB columns', () => {
    const row = {
      id: 'abc-123',
      name: 'Carol',
      email: 'carol@example.com',
      password_hash: 'hashed',
      is_verified: true,
      is_deleted: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-02'),
    };
    const user = User.fromRow(row);
    expect(user.id).toBe('abc-123');
    expect(user.isVerified).toBe(true);
    expect(user.passwordHash).toBe('hashed');
  });
});
