```javascript
'use strict';

const bcrypt = require('bcrypt');
const NodemailerEmailService = require('../adapters/outbound/email/nodemailerEmailService');
const { generateOtp } = require('../utils/generateOtp');

class UserService {
  async registerUser(userDetails) {
    const { email, password, name } = userDetails;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assuming user creation logic is handled here
    // Add user to database
    // const user = await userRepository.createUser({ email, hashedPassword, name });

    // Generate OTP
    const otp = generateOtp();

    // Send OTP email
    await NodemailerEmailService.sendOtpEmail(email, otp);

    // Assuming OTP storage logic is handled here
    // await otpRepository.storeOtp(user.id, otp);

    return { message: 'User registered. Please check your email for the OTP' };
  }
}

module.exports = new UserService();
```