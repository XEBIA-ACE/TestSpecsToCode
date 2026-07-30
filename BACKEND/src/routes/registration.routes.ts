```typescript
import { Router, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { SendGridEmailAdapter } from '../adapters/sendgrid-email.adapter';
import crypto from 'crypto';

function generateEmailVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function createRegistrationRouter(userRepository: UserRepository, tokenRepository: TokenRepository, emailAdapter: SendGridEmailAdapter): Router {
  const router = Router();

  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await userRepository.createUser(name, email, password);
      
      const token = generateEmailVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      await tokenRepository.saveVerificationToken(user.id, token, expiresAt);

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      const emailContent = {
        to: email,
        from: process.env.SENDGRID_VERIFIED_SENDER,
        subject: 'Verify your email address',
        text: `Please verify your account by clicking on the following link: ${verificationLink}`,
        html: `<p>Please verify your account by clicking on the following link: <a href="${verificationLink}">Verify Email</a></p>`,
      };
      
      await emailAdapter.send(emailContent);

      res.status(201).json({ message: 'User registered. Please check your email for verification link.', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ error: 'Could not register user.' });
    }
  });

  return router;
}
```