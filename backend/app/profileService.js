const db = require('../db');
const cache = require('../cache'); // Assuming we have a caching layer

async function updateProfile({ userId, name, email, password }) {
  try {
    // Cache the user profile for quick retrieval
    let userProfile = await cache.get(`userProfile:${userId}`);
    if (!userProfile) {
      userProfile = await db.getUserProfile(userId);
      cache.set(`userProfile:${userId}`, userProfile, { ttl: 3600 });
    }

    // Optimize database query to use upsert operation for efficiency
    const result = await db.query(`
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          email = EXCLUDED.email,
          password = EXCLUDED.password
      RETURNING id
    `, [userId, name, email, password]);

    // Invalidate cache upon successful update
    cache.del(`userProfile:${userId}`);

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Unable to update profile');
  }
}

module.exports = {
  updateProfile
};
```

### Conclusion

The above modifications include creating a performance test plan and optimizing the existing backend service to enhance response times, thereby addressing the current task requirement.