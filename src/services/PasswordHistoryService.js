```javascript
const db = require('../database');

class PasswordHistoryService {
  async isPasswordReused(userId, newPassword) {
    const lastFivePasswords = await this.getLastFivePasswords(userId);
    return lastFivePasswords.some(pwHash => BcryptPasswordHasher.verifyHash(newPassword, pwHash));
  }

  async getLastFivePasswords(userId) {
    // Fetch the last 5 password hashes for the user from the database
    const query = 'SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY changed_at DESC LIMIT 5';
    const result = await db.query(query, [userId]);
    return result.rows.map(row => row.password_hash);
  }

  async updatePasswordHistory(userId, newHashedPassword) {
    // Insert the new hashed password into the password history record
    const query = 'INSERT INTO password_history (user_id, password_hash, changed_at) VALUES ($1, $2, NOW())';
    await db.query(query, [userId, newHashedPassword]);
  }
}

module.exports = new PasswordHistoryService();
```