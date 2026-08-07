```javascript
const express = require('express');
const { body } = require('express-validator');
const userProfileController = require('../controllers/userProfileController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Profile update route
router.put('/profile', 
  authMiddleware, 
  [
    body('name')
      .isLength({ min: 1, max: 100 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must be alphabetic and between 1 to 100 characters long.')
  ], 
  userProfileController.updateProfile
);

module.exports = router;
```