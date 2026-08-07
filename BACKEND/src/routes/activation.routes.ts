```typescript
import express, { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { TokenExpiredException, TokenNotFoundException } from '../errors/registration.errors';

function createActivationRouter(userRepository: UserRepository, tokenRepository: TokenRepository) {
  const router = express.Router();

  router.get('/activate/:token', async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const activationToken = await tokenRepository.findToken(token);

      if (!activationToken) {
        throw new TokenNotFoundException('Activation token not found');
      }

      if (activationToken.isExpired()) {
        throw new TokenExpiredException('Activation token expired');
      }

      const user = await userRepository.findUserById(activationToken.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.isVerified = true;
      await userRepository.updateUser(user);

      return res.status(200).json({ message: 'Email successfully verified, account activated.' });
    } catch (error) {
      if (error instanceof TokenNotFoundException || error instanceof TokenExpiredException) {
        return res.status(error instanceof TokenExpiredException ? 410 : 404)
                  .json({ error: error.message });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = { createActivationRouter };
```