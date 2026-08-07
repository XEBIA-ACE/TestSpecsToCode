```typescript
import type { Database } from 'better-sqlite3';

interface User {
  id: string;
  name: string;
  email: string;
  // Additional user fields
}

export class UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createUser(name: string, email: string, password: string): Promise<User> {
    const stmt = this.db.prepare('INSERT INTO users (name, email, password, is_email_verified) VALUES (?, ?, ?, 0)');
    const info = stmt.run(name, email, password);

    return {
      id: info.lastInsertRowid as string,
      name,
      email,
    };
  }
}
```