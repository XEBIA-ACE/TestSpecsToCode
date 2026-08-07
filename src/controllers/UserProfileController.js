```javascript
const UserProfileService = require('../services/UserProfileService');

class UserProfileController {
  static async createUserProfile(userProfileData) {
    if (!userProfileData || typeof userProfileData !== 'object') {
      throw new Error('Invalid user profile data provided');
    }
    return await UserProfileService.saveUserProfile(userProfileData);
  }
}

module.exports = UserProfileController;
```