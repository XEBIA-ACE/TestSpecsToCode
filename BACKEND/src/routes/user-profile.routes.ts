```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/UserRepository';

const router = Router();
const userRepository = new UserRepository();

router.get('/profile', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userProfile = await userRepository.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```