```javascript
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sanitize = require('mongo-sanitize'); // To sanitize inputs

// Validate and update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id; // Assume user ID is available in request object
    const { name, email, password } = req.body;

    // Sanitize inputs
    const sanitizedEmail = sanitize(email);
    const sanitizedName = sanitize(name);

    // Find user and update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = sanitizedName || user.name;
    user.email = sanitizedEmail || user.email;

    if (password) {
      user.setPassword(password);
    }

    await user.save();
    res.json({ msg: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
```