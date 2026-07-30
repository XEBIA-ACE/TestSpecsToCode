```javascript
'use strict';

const bcrypt = require('bcrypt');
const { User } = require('../domain/entities/user');
const { ConflictError } = require('../domain/errors/domainErrors');
const userRepository = require('../infrastructure/repositories/userRepository');

const SALT_ROUNDS = 10;

async function register(userData) {
  if (!validateEmail(userData.email)) {
    throw new Error('Invalid email format.');
  }

  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError('Email already in use.');
  }

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const user = new User({
    email: userData.email,
    name: userData.name,
    passwordHash: hashedPassword,
  });

  await userRepository.save(user);

  // Trigger sending an OTP or welcome email
  // Example: await sendRegistrationEmail(user.email);

  return user.toPublic();
}

async function authenticate(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials.');
  }

  return user.toPublic();
}

module.exports = {
  register,
  authenticate,
};
```