import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { updateUserProfile } from '../services/user.service';

const router = Router();

// Validation rules for user profile update
const validateProfileUpdate = [
  body('name').isString().isLength({ min: 1 }).withMessage('Name must be provided'),
  body('email').isEmail().withMessage('Must be a valid email'),
  // Add other validation rules as needed
];

router.post(
  '/profile/update',
  validateProfileUpdate,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      await updateUserProfile(req.body);
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;