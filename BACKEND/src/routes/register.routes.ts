import { Router } from 'express';
import { check } from 'express-validator';
import { registerUser } from '../controllers/register.controller';

const router = Router();

router.post('/register',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

export default router;
