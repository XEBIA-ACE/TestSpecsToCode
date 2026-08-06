```javascript
const express = require('express');
const { updateUserProfile } = require('../controllers/userProfileController');
const router = express.Router();

// Middleware for authentication (placeholder, replace with actual implementation)
const authMiddleware = (req, res, next) => {
  // Authenticate user
  next();
};

// Update user profile
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
```