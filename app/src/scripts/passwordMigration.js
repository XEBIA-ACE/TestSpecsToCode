const bcrypt = require('bcrypt');
const db = require('../infrastructure/db/pool');
const logger = require('../infrastructure/logger');

// Define the number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

async function migratePasswords() {
  try {
    // Fetch users with plain-text passwords
    const { rows: users } = await db.query('SELECT id, password FROM users WHERE password NOT LIKE ''$2%''');
    logger.info(`Found ${users.length} users with plain-text passwords.`);
    
    for (const user of users) {
      const { id, password } = user;
      
      try {
        // Hash the plain-text password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // Update the user entry with the hashed password
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
        logger.info(`Successfully hashed and updated password for user ID: ${id}`);
      } catch (err) {
        logger.error(`Failed to update password for user ID: ${id} — ${err.message}`);
      }
    }

    logger.info('Password migration completed.');
  } catch (err) {
    logger.error(`Failed to migrate passwords — ${err.message}`);
  } finally {
    // Close the database connection
    await db.end();
  }
}

// Execute the migration
migratePasswords();
