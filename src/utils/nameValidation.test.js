/**
 * nameValidation.test.js
 * Unit tests for sanitizeName, validateName, and sanitizeAndValidateName.
 *
 * Coverage target: ≥ 80% (per constitution.md)
 */

import {
  sanitizeName,
  validateName,
  sanitizeAndValidateName,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from '../utils/nameValidation';

// ---------------------------------------------------------------------------
// sanitizeName
// ---------------------------------------------------------------------------
describe('sanitizeName', () => {
  test('returns empty string for non-string input', () => {
    expect(sanitizeName(null)).toBe('');
    expect(sanitizeName(undefined)).toBe('');
    expect(sanitizeName(42)).toBe('');
  });

  test('passes through a clean name unchanged (after trim)', () => {
    expect(sanitizeName('Alice')).toBe('Alice');
    expect(sanitizeName("O'Brien")).toBe("O'Brien");
    expect(sanitizeName('Mary-Jane')).toBe('Mary-Jane');
  });

  test('strips HTML tags', () => {
    expect(sanitizeName('<b>Alice</b>')).toBe('Alice');
    expect(sanitizeName('<img src=x>')).toBe('');
  });

  test('strips script tags and their content', () => {
    expect(sanitizeName('<script>alert(1)</script>')).toBe('');
    expect(sanitizeName('Alice<script>evil()</script>')).toBe('Alice');
  });

  test('removes javascript: URI scheme', () => {
    expect(sanitizeName('javascript:alert(1)')).not.toContain('javascript:');
  });

  test('removes data: URI scheme', () => {
    expect(sanitizeName('data:text/html,<h1>x</h1>')).not.toContain('data:');
  });

  test('removes inline event handlers', () => {
    expect(sanitizeName('<div onclick="evil()">name</div>')).toBe('name');
    expect(sanitizeName('<img onerror="evil()">')).toBe('');
  });

  test('decodes HTML entities and re-strips resulting tags', () => {
    // &lt;script&gt; should not survive after entity decode + re-strip
    const result = sanitizeName('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  test('trims leading and trailing whitespace', () => {
    expect(sanitizeName('  Alice  ')).toBe('Alice');
  });
});

// ---------------------------------------------------------------------------
// validateName
// ---------------------------------------------------------------------------
describe('validateName', () => {
  test('returns invalid for non-string input', () => {
    const result = validateName(42);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('returns invalid for empty string', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  test('returns invalid for whitespace-only string', () => {
    const result = validateName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  test(`returns invalid when shorter than ${NAME_MIN_LENGTH} characters`, () => {
    const result = validateName('A');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least/i);
  });

  test(`returns invalid when longer than ${NAME_MAX_LENGTH} characters`, () => {
    const longName = 'A'.repeat(NAME_MAX_LENGTH + 1);
    const result = validateName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceed/i);
  });

  test('returns invalid for names with disallowed characters', () => {
    const result = validateName('Alice123');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/only contain/i);
  });

  test('returns invalid for names with special symbols', () => {
    expect(validateName('Alice@Domain').valid).toBe(false);
    expect(validateName('Alice<>').valid).toBe(false);
    expect(validateName('Alice&Bob').valid).toBe(false);
  });

  test('returns valid for a normal name', () => {
    expect(validateName('Alice').valid).toBe(true);
    expect(validateName('Alice').error).toBeNull();
  });

  test('returns valid for a name with a hyphen', () => {
    expect(validateName('Mary-Jane').valid).toBe(true);
  });

  test("returns valid for a name with an apostrophe", () => {
    expect(validateName("O'Brien").valid).toBe(true);
  });

  test('returns valid for a name with spaces', () => {
    expect(validateName('John Smith').valid).toBe(true);
  });

  test('returns valid for a name exactly at max length', () => {
    const maxName = 'A'.repeat(NAME_MAX_LENGTH);
    expect(validateName(maxName).valid).toBe(true);
  });

  test('returns valid for accented characters', () => {
    expect(validateName('Ångström').valid).toBe(true);
    expect(validateName('José').valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sanitizeAndValidateName
// ---------------------------------------------------------------------------
describe('sanitizeAndValidateName', () => {
  test('returns sanitized value, valid flag, and null error for clean input', () => {
    const result = sanitizeAndValidateName('Alice');
    expect(result.sanitized).toBe('Alice');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('sanitizes XSS payload and then validates the cleaned value', () => {
    // After stripping <script>...</script>, the remaining value is empty → invalid
    const result = sanitizeAndValidateName('<script>alert(1)</script>');
    expect(result.sanitized).toBe('');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  test('sanitizes partial XSS and validates remaining text', () => {
    const result = sanitizeAndValidateName('Alice<b>!</b>');
    expect(result.sanitized).toBe('Alice!');
    // '!' is not an allowed character
    expect(result.valid).toBe(false);
  });

  test('returns invalid for empty string', () => {
    const result = sanitizeAndValidateName('');
    expect(result.valid).toBe(false);
  });

  test('returns invalid for too-short name', () => {
    const result = sanitizeAndValidateName('A');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least/i);
  });

  test('returns invalid for too-long name', () => {
    const result = sanitizeAndValidateName('A'.repeat(NAME_MAX_LENGTH + 1));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceed/i);
  });
});
