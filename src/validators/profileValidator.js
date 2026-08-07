/**
 * Profile Validation Utilities
 *
 * Validates and sanitizes the Name field according to spec requirements:
 *  - Length: 1–100 characters
 *  - Allowed characters: letters, spaces, hyphens, apostrophes
 *  - Sanitized against XSS (strips HTML tags and dangerous sequences)
 */

'use strict';

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 100;

// Allowed: Unicode letters, spaces, hyphens, apostrophes
const NAME_PATTERN = /^[\p{L}\s'\-]+$/u;

// Rudimentary XSS sanitizer — strips HTML tags and encodes angle brackets.
// In production, prefer a library such as `xss` or `DOMPurify` (server-side).
function sanitizeName(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validates the `name` field.
 *
 * @param {string} name - Raw name value from request body
 * @returns {{ valid: boolean, sanitized: string, errors: string[] }}
 */
function validateName(name) {
  const errors = [];

  if (typeof name !== 'string') {
    return { valid: false, sanitized: '', errors: ['Name must be a string.'] };
  }

  const trimmed = name.trim();

  if (trimmed.length < NAME_MIN_LENGTH) {
    errors.push(`Name must be at least ${NAME_MIN_LENGTH} character(s).`);
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    errors.push(`Name must not exceed ${NAME_MAX_LENGTH} characters.`);
  }

  if (trimmed.length > 0 && !NAME_PATTERN.test(trimmed)) {
    errors.push(
      'Name may only contain letters, spaces, hyphens, and apostrophes.'
    );
  }

  const sanitized = sanitizeName(trimmed);

  return { valid: errors.length === 0, sanitized, errors };
}

module.exports = { validateName, sanitizeName, NAME_MIN_LENGTH, NAME_MAX_LENGTH };
