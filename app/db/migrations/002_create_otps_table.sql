-- Migration: 002_create_otps_table
-- Stores one-time passwords used for email verification and login MFA.
-- Each OTP is linked to a user and expires after a configurable window.

CREATE TABLE IF NOT EXISTS otps (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,

  -- The 6-digit (or configurable-length) OTP code
  code        VARCHAR(16)   NOT NULL,

  -- Purpose of the OTP: 'email_verification' | 'login'
  purpose     VARCHAR(32)   NOT NULL DEFAULT 'email_verification',

  -- Delivery outcome: 'pending' | 'sent' | 'failed'
  status      VARCHAR(16)   NOT NULL DEFAULT 'pending',

  -- Hard expiry timestamp; application must reject codes past this point
  expires_at  TIMESTAMPTZ   NOT NULL,

  -- Set when the OTP is successfully consumed so it cannot be reused
  used_at     TIMESTAMPTZ,

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast look-up by user + purpose when verifying a submitted code
CREATE INDEX IF NOT EXISTS idx_otps_user_purpose
  ON otps (user_id, purpose, expires_at)
  WHERE used_at IS NULL;
