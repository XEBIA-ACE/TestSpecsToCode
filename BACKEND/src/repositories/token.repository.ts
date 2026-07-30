```typescript
import type { Database } from 'better-sqlite3';

export class TokenRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async saveVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const stmt = this.db.prepare('INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
    stmt.run(userId, token, expiresAt.toISOString());
  }
}
```