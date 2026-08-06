```javascript
const { body } = require('express-validator');

exports.userProfileUpdateValidation = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];
```