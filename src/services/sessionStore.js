```javascript
const redisClient = require('../config/redisClient');

const sessionStore = {
  async invalidateAllSessionsForUser(userId) {
    // Assumed structure: sessions are stored with a key pattern like `session:userId:sessionId`
    const sessionKeys = await redisClient.keys(`session:${userId}:*`);
    if (sessionKeys.length > 0) {
      await redisClient.del(sessionKeys);
    }
  }
};

module.exports = sessionStore;
```