/**
 * Unit tests — Profile Validator
 */

'use strict';

const { validateName } = require('../../src/validators/profileValidator');

describe('validateName', () => {
  test('accepts a simple valid name', () => {
    const result = validateName('Alice');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Alice');
    expect(result.errors).toHaveLength(0);
  });

  test('accepts names with hyphens and apostrophes', () => {
    const result = validateName("O'Brien-Smith");
    expect(result.valid).toBe(true);
  });

  test('accepts names with Unicode letters', () => {
    const result = validateName('Ångström');
    expect(result.valid).toBe(true);
  });

  test('rejects empty string', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('rejects name longer than 100 characters', () => {
    const result = validateName('A'.repeat(101));
    expect(result.valid).toBe(false);
  });

  test('rejects name with HTML tags (XSS attempt)', () => {
    const result = validateName('<script>alert(1)</script>');
    expect(result.valid).toBe(false);
  });

  test('rejects non-string input', () => {
    const result = validateName(42);
    expect(result.valid).toBe(false);
  });

  test('trims leading/trailing whitespace before validation', () => {
    const result = validateName('  Alice  ');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Alice');
  });

  test('accepts exactly 100 characters', () => {
    const result = validateName('A'.repeat(100));
    expect(result.valid).toBe(true);
  });
});
