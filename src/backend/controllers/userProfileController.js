```javascript
const { validationResult } = require('express-validator');
const sanitize = require('sanitize-html');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendEmailNotification } = require('../services/emailService');

exports.updateProfile = async (req, res) => {
  try {
    // Perform back-end validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const sanitizedName = sanitize(name, {
      allowedTags: [],
      allowedAttributes: {}
    });

    // Retrieve user data
    const user = await User.findById(req.user.id);

    // Log the name change
    if (user.name !== sanitizedName) {
      await AuditLog.create({
        userId: user.id,
        changeType: 'NameChange',
        originalValue: user.name,
        newValue: sanitizedName,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Update user name
      user.name = sanitizedName;
      await user.save();

      // Send email notification for the name change
      sendEmailNotification(user.email, 'Your Name Has Been Changed', `Your name has been updated to ${sanitizedName}.`);
    }

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Server Error');
  }
};
```