/**
 * nameValidation.js
 * Real-time validation utilities for the Name field.
 * Enforces length and character constraints, and applies XSS sanitization.
 *
 * Constraints (aligned with spec.md):
 *   - Minimum length: 2 characters
 *   - Maximum length: 100 characters
 *   - Allowed characters: letters (including accented/Unicode), spaces, hyphens, apostrophes
 *   - XSS: strips HTML tags and dangerous attribute patterns before validation
 */

// ---------------------------------------------------------------------------
// XSS Sanitization
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags and common XSS vectors from a string.
 * This is a defence-in-depth client-side check; the server MUST also sanitize.
 *
 * @param {string} value - Raw input string
 * @returns {string} Sanitized string with HTML/script content removed
 */
export function sanitizeName(value) {
  if (typeof value !== 'string') return '';

  return (
    value
      // Remove script blocks (including content)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove javascript: and data: URI schemes
      .replace(/javascript\s*:/gi, '')
      .replace(/data\s*:/gi, '')
      // Remove on* event handler attributes (e.g. onerror=, onclick=)
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      // Decode common HTML entities that could hide XSS payloads
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // Re-strip after entity decode
      .replace(/<[^>]*>/g, '')
      .trim()
  );
}

// ---------------------------------------------------------------------------
// Length & Character Constraints
// ---------------------------------------------------------------------------

/** Minimum allowed length for the Name field */
export const NAME_MIN_LENGTH = 2;

/** Maximum allowed length for the Name field */
export const NAME_MAX_LENGTH = 100;

/**
 * Regex that matches ONLY allowed characters:
 *   - Unicode letters (\p{L}) — covers accented and non-Latin names
 *   - Spaces, hyphens, apostrophes
 *
 * Falls back to a broad Latin + common-character pattern in environments
 * that do not support Unicode property escapes.
 */
const ALLOWED_CHARS_UNICODE = /^[\p{L}\s'\-]+$/u;
const ALLOWED_CHARS_FALLBACK = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;

function getAllowedCharsRegex() {
  try {
    // Test if the engine supports Unicode property escapes
    new RegExp('\\p{L}', 'u'); // eslint-disable-line no-new
    return ALLOWED_CHARS_UNICODE;
  } catch {
    return ALLOWED_CHARS_FALLBACK;
  }
}

const ALLOWED_CHARS_REGEX = getAllowedCharsRegex();

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a (pre-sanitized) name value.
 *
 * @param {string} value - The sanitized name string to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
export function validateName(value) {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Name must be a string.' };
  }

  if (value.trim().length === 0) {
    return { valid: false, error: 'Name is required.' };
  }

  if (value.trim().length < NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Name must be at least ${NAME_MIN_LENGTH} characters long.`,
    };
  }

  if (value.length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Name must not exceed ${NAME_MAX_LENGTH} characters.`,
    };
  }

  if (!ALLOWED_CHARS_REGEX.test(value.trim())) {
    return {
      valid: false,
      error:
        'Name may only contain letters, spaces, hyphens, and apostrophes.',
    };
  }

  return { valid: true, error: null };
}

/**
 * Sanitizes then validates a name value.
 * This is the primary entry point for real-time input handling.
 *
 * @param {string} rawValue - Raw value from the input element
 * @returns {{ sanitized: string, valid: boolean, error: string|null }}
 */
export function sanitizeAndValidateName(rawValue) {
  const sanitized = sanitizeName(rawValue);
  const { valid, error } = validateName(sanitized);
  return { sanitized, valid, error };
}
