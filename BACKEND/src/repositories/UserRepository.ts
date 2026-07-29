```typescript
import { Database } from 'better-sqlite3';
import type { UserProfile } from '../models/User';

class UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public findById(userId: string): UserProfile | null {
    const stmt = this.db.prepare('SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ?');
    return stmt.get(userId) ?? null;
  }
}

export { UserRepository };
```