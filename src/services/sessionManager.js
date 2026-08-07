```javascript
const sessionStore = require('./sessionStore');

const sessionManager = {
  async invalidateSessions(userId) {
    // Invalidate all sessions for the user
    await sessionStore.invalidateAllSessionsForUser(userId);
  }
};

module.exports = sessionManager;
```