-- Migration: 001_create_users_table
-- Creates the users table with email verification fields.
-- Existing data integrity is maintained via NOT NULL defaults and constraints.

CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,

  -- Email verification status
  -- FALSE until the user confirms their email via OTP
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,

  -- Soft-delete flag; deleted accounts cannot authenticate
  is_deleted    BOOLEAN       NOT NULL DEFAULT FALSE,

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast email look-ups (login, duplicate-check)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Automatically keep updated_at current on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
