/**
 * PasswordInput – enhanced password field with:
 *   • Real-time complexity feedback (PasswordStrengthBar)
 *   • Show/hide toggle (WCAG 2.1 AA compliant)
 *   • Full keyboard accessibility
 *   • ARIA live regions for screen-reader announcements
 *
 * WCAG 2.1 AA compliance notes:
 *   1.3.1  – Input has an associated <label> (via htmlFor / aria-labelledby)
 *   1.4.1  – Strength not conveyed by colour alone (text label + rule list)
 *   1.4.3  – Text contrast ≥ 4.5:1
 *   1.4.11 – UI component contrast ≥ 3:1
 *   2.1.1  – Fully keyboard operable (toggle button reachable via Tab)
 *   2.4.6  – Descriptive labels and headings
 *   4.1.2  – Name, Role, Value for all interactive elements
 *   4.1.3  – Status messages via aria-live regions
 */

import React, { useId, useState, useCallback } from 'react';
import { evaluatePasswordComplexity } from './passwordUtils';
import PasswordStrengthBar from './PasswordStrengthBar';
import styles from './PasswordInput.module.css';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label text rendered in a <label> element */
  label: string;
  /** Show the strength bar and rule checklist below the input */
  showStrengthFeedback?: boolean;
  /** Controlled value (use with onChange) */
  value?: string;
  /** Callback fired on every keystroke */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Additional class applied to the outermost wrapper */
  className?: string;
  /** Error message displayed below the input */
  errorMessage?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  showStrengthFeedback = false,
  value,
  onChange,
  className,
  errorMessage,
  id: externalId,
  disabled,
  ...rest
}) => {
  // Generate stable IDs for ARIA associations
  const generatedId = useId();
  const inputId = externalId ?? `password-input-${generatedId}`;
  const strengthBarId = `${inputId}-strength`;
  const errorId = `${inputId}-error`;

  const [visible, setVisible] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  // Support both controlled and uncontrolled usage
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    },
    [isControlled, onChange],
  );

  const toggleVisibility = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const complexity = evaluatePasswordComplexity(currentValue);

  // Build aria-describedby list dynamically
  const describedBy = [
    showStrengthFeedback && currentValue ? strengthBarId : null,
    errorMessage ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {/* Visible label – associated via htmlFor (WCAG 1.3.1, 4.1.2) */}
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      <div className={styles.inputRow}>
        <input
          {...rest}
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? 'true' : undefined}
          autoComplete={rest.autoComplete ?? 'current-password'}
          className={[styles.input, errorMessage ? styles['input--error'] : null]
            .filter(Boolean)
            .join(' ')}
        />

        {/* Show/hide toggle button (WCAG 2.1.1, 4.1.2) */}
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          className={styles.toggleButton}
          // aria-pressed communicates toggle state (WCAG 4.1.2)
          aria-pressed={visible}
          // aria-controls links the button to the input it affects
          aria-controls={inputId}
          // Descriptive label so screen readers announce the action
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {/* Decorative SVG icons – hidden from AT via aria-hidden */}
          {visible ? (
            <svg
              aria-hidden="true"
              focusable="false"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Eye-off icon */}
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              focusable="false"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Eye icon */}
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Inline error message (WCAG 3.3.1) */}
      {errorMessage && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}

      {/* Real-time strength feedback (WCAG 4.1.3 – live region inside component) */}
      {showStrengthFeedback && (
        <PasswordStrengthBar complexity={complexity} id={strengthBarId} />
      )}
    </div>
  );
};

export default PasswordInput;
