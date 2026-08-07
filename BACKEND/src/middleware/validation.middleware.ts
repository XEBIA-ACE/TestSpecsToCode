```typescript
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateProfile = [
  body('name').isString().notEmpty().withMessage('Name is required and should be a string'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  // Additional validators can be added as needed
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
```