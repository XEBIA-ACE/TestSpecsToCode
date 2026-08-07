```typescript
export class Token {
  userId: string;
  token: string;
  expiresAt: Date;

  constructor(tokenData: { userId: string; token: string; expiresAt: Date }) {
    this.userId = tokenData.userId;
    this.token = tokenData.token;
    this.expiresAt = tokenData.expiresAt;
  }

  static fromRow(row: any): Token {
    return new Token({
      userId: row.user_id,
      token: row.token,
      expiresAt: new Date(row.expires_at),
    });
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
```