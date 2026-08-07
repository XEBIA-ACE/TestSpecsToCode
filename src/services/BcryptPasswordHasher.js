```javascript
const bcrypt = require('bcrypt');

class BcryptPasswordHasher {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async verifyPassword(userId, inputPassword) {
    // Fetch current password hash from DB and compare
    const query = 'SELECT password_hash FROM users WHERE id = $1';
    const result = await db.query(query, [userId]);
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    const storedHash = result.rows[0].password_hash;
    return await bcrypt.compare(inputPassword, storedHash);
  }

  async verifyHash(rawPassword, hashedPassword) {
    return await bcrypt.compare(rawPassword, hashedPassword);
  }
}

module.exports = new BcryptPasswordHasher();
```