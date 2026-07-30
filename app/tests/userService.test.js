```javascript
'use strict';

const userService = require('../src/application/userService');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { validateEmail } = require('../src/utils/validation');
const db = require('../src/infrastructure/db/pool');

jest.mock('nodemailer');
jest.mock('bcrypt');
jest.mock('../src/utils/validation');
jest.mock('../src/infrastructure/db/pool');

describe('User Registration Tests', () => {
  let userData;
  
  beforeEach(() => {
    userData = { 
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    };
    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true)
    });
    bcrypt.hash.mockResolvedValue('hashedPassword');
    validateEmail.mockReturnValue(true);
    db.query.mockResolvedValue({ rows: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should hash the password using bcrypt before saving', async () => {
    await userService.register(userData);
    
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
  });

  test('Should validate the email format correctly', async () => {
    await userService.register(userData);
    
    expect(validateEmail).toHaveBeenCalledWith(userData.email);
  });

  test('Should send an OTP email on successful registration', async () => {
    await userService.register(userData);
    
    const sendMailMock = nodemailer.createTransport().sendMail;
    expect(sendMailMock).toHaveBeenCalled();
  });

  test('Should handle duplicate email registration attempts', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ email: userData.email }] });
    
    await expect(userService.register(userData))
      .rejects
      .toThrow('Email already in use.');
  });
  
  test('Should throw an error if email format is invalid', async () => {
    validateEmail.mockReturnValueOnce(false);
    
    await expect(userService.register(userData))
      .rejects
      .toThrow('Invalid email format.');
  });

});

describe('UserService Login Tests', () => {
  let loginData;

  beforeEach(() => {
    loginData = {
      email: 'test@example.com',
      password: 'Password123!'
    };
    db.query.mockResolvedValue({
      rows: [
        {
          id: 'uuid-test',
          password_hash: 'hashedPassword'
        }
      ]
    });
    bcrypt.compare.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should validate the password using bcrypt during login', async () => {
    await userService.login(loginData.email, loginData.password);
    
    expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
  });

  test('Should throw an error if bcrypt comparison fails', async () => {
    bcrypt.compare.mockResolvedValueOnce(false);
    
    await expect(userService.login(loginData.email, loginData.password))
      .rejects
      .toThrow('Invalid credentials.');
  });
});
```