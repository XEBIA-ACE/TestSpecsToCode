```typescript
import { Database } from 'better-sqlite3';
import { User } from '../domain/entities/user';
import bcrypt from 'bcrypt';

export class UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Function to update user profile
  public async updateUserProfile(userId: string, profileData: { name?: string; email?: string; password?: string }): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (profileData.password) {
      profileData.password = await bcrypt.hash(profileData.password, 10);
    }

    const updatedFields = {
      ...user,
      ...profileData,
    };

    this.db
      .prepare(`
        UPDATE users 
        SET name = ?, email = ?, password_hash = ?
        WHERE id = ?
      `)
      .run(
        updatedFields.name,
        updatedFields.email,
        updatedFields.password_hash,
        userId
      );

    return this.getUserById(userId);
  }

  private getUserById(userId: string): User | null {
    const row = this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId);
    
    if (row) {
      return User.fromRow(row);
    }
    return null;
  }
}

```