```javascript
const express = require('express');
const UserProfileController = require('../controllers/UserProfileController');

const createUserProfileRouter = express.Router();

createUserProfileRouter.post('/create', async (req, res) => {
  try {
    const userProfileData = req.body;
    const userProfile = await UserProfileController.createUserProfile(userProfileData);
    res.status(201).json(userProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = createUserProfileRouter;
```