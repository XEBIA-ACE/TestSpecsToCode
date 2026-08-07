/**
 * Password complexity utilities for real-time feedback.
 * Supports spec: Change Account Password – complexity validation
 * (8+ chars, uppercase, lowercase, number, special character).
 */

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordComplexityResult {
  score: number; // 0–5
  level: PasswordStrengthLevel;
  /** Human-readable label shown in the strength bar */
  label: string;
  /** Individual rule results for real-time inline feedback */
  rules: PasswordRuleResult[];
}

export interface PasswordRuleResult {
  id: string;
  description: string;
  passed: boolean;
}

const RULES: Array<{ id: string; description: string; test: (pw: string) => boolean }> = [
  {
    id: 'min-length',
    description: 'At least 8 characters',
    test: (pw) => pw.length >= 8,
  },
  {
    id: 'uppercase',
    description: 'At least one uppercase letter (A–Z)',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: 'lowercase',
    description: 'At least one lowercase letter (a–z)',
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    id: 'number',
    description: 'At least one number (0–9)',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    id: 'special',
    description: 'At least one special character (!@#$%^&* …)',
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

const LEVEL_MAP: Record<number, { level: PasswordStrengthLevel; label: string }> = {
  0: { level: 'empty', label: '' },
  1: { level: 'weak', label: 'Weak' },
  2: { level: 'weak', label: 'Weak' },
  3: { level: 'fair', label: 'Fair' },
  4: { level: 'good', label: 'Good' },
  5: { level: 'strong', label: 'Strong' },
};

/**
 * Evaluate password complexity against all rules.
 * Returns a score (0–5), a strength level, and per-rule results.
 */
export function evaluatePasswordComplexity(password: string): PasswordComplexityResult {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: '',
      rules: RULES.map((r) => ({ id: r.id, description: r.description, passed: false })),
    };
  }

  const ruleResults: PasswordRuleResult[] = RULES.map((r) => ({
    id: r.id,
    description: r.description,
    passed: r.test(password),
  }));

  const score = ruleResults.filter((r) => r.passed).length;
  const { level, label } = LEVEL_MAP[score] ?? { level: 'weak', label: 'Weak' };

  return { score, level, label, rules: ruleResults };
}
