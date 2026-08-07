```sql
-- 009_add_email_verification_fields.sql

ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verification_expires_at DATETIME;
```