'use strict';

/**
 * OTP domain entity.
 *
 * Represents a row from the `otps` table.
 * Used for both email-verification OTPs (sent at registration) and
 * login MFA OTPs (sent after credential validation).
 *
 * Fields
 * ──────
 *  id        – UUID primary key
 *  userId    – FK → users.id
 *  code      – the numeric/alphanumeric OTP string
 *  purpose   – 'email_verification' | 'login'
 *  status    – 'pending' | 'sent' | 'failed'
 *  expiresAt – hard expiry; application rejects codes past this point
 *  usedAt    – set when the OTP is consumed; prevents reuse
 *  createdAt – row creation timestamp
 */
class Otp {
  /**
   * @param {object}      params
   * @param {string}      params.id
   * @param {string}      params.userId
   * @param {string}      params.code
   * @param {string}      [params.purpose='email_verification']
   * @param {string}      [params.status='pending']
   * @param {Date}        params.expiresAt
   * @param {Date|null}   [params.usedAt=null]
   * @param {Date}        [params.createdAt]
   */
  constructor({
    id,
    userId,
    code,
    purpose   = 'email_verification',
    status    = 'pending',
    expiresAt,
    usedAt    = null,
    createdAt = new Date(),
  }) {
    this.id        = id;
    this.userId    = userId;
    this.code      = code;
    this.purpose   = purpose;
    this.status    = status;
    this.expiresAt = expiresAt;
    this.usedAt    = usedAt;
    this.createdAt = createdAt;
  }

  // ── Predicates ──────────────────────────────────────────────────────────

  /** True when the OTP has not yet expired and has not been used. */
  isValid() {
    return !this.usedAt && new Date() < this.expiresAt;
  }

  /** True when the OTP has already been consumed. */
  isUsed() {
    return this.usedAt !== null;
  }

  /** True when the OTP has passed its expiry time. */
  isExpired() {
    return new Date() >= this.expiresAt;
  }

  // ── Factory helpers ─────────────────────────────────────────────────────

  /**
   * Reconstruct an Otp entity from a raw PostgreSQL row.
   *
   * @param {object} row - Raw DB row
   * @returns {Otp}
   */
  static fromDbRow(row) {
    return new Otp({
      id:        row.id,
      userId:    row.user_id,
      code:      row.code,
      purpose:   row.purpose,
      status:    row.status,
      expiresAt: row.expires_at,
      usedAt:    row.used_at,
      createdAt: row.created_at,
    });
  }
}

module.exports = Otp;
