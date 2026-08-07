/**
 * PasswordStrengthBar – visual indicator for password complexity.
 *
 * WCAG 2.1 AA compliance:
 *  - Uses role="meter" with aria-valuenow / aria-valuemin / aria-valuemax
 *  - aria-label describes the meter purpose
 *  - aria-valuetext provides a human-readable strength label
 *  - Colour is NOT the sole means of conveying information (text label shown)
 *  - Colour contrast ratios meet 3:1 minimum for UI components (WCAG 1.4.11)
 */

import React from 'react';
import type { PasswordComplexityResult } from './passwordUtils';
import styles from './PasswordStrengthBar.module.css';

export interface PasswordStrengthBarProps {
  /** Result from evaluatePasswordComplexity() */
  complexity: PasswordComplexityResult;
  /** Unique id used to associate the bar with the input via aria-describedby */
  id?: string;
}

const SEGMENT_COUNT = 5;

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ complexity, id }) => {
  const { score, level, label, rules } = complexity;

  if (level === 'empty') {
    return null;
  }

  return (
    <div className={styles.wrapper} id={id}>
      {/* Strength meter bar */}
      <div
        role="meter"
        aria-label="Password strength"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={SEGMENT_COUNT}
        aria-valuetext={label}
        className={styles.meterContainer}
      >
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <div
            key={i}
            className={[
              styles.segment,
              i < score ? styles[`segment--${level}`] : styles['segment--empty'],
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Text label – ensures colour is not the sole indicator (WCAG 1.4.1) */}
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>

      {/* Per-rule checklist – live region so screen readers announce changes */}
      <ul
        className={styles.ruleList}
        aria-label="Password requirements"
        aria-live="polite"
        aria-atomic="false"
      >
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={[styles.rule, rule.passed ? styles['rule--passed'] : styles['rule--failed']]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Decorative icon hidden from AT; status conveyed via text */}
            <span className={styles.ruleIcon} aria-hidden="true">
              {rule.passed ? '✓' : '✗'}
            </span>
            <span className={styles.ruleText}>{rule.description}</span>
            {/* Visually hidden status for screen readers */}
            <span className={styles.srOnly}>{rule.passed ? '(met)' : '(not met)'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthBar;
