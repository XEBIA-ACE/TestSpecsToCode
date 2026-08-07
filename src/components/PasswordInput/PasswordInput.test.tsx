/**
 * Unit tests for PasswordInput feature
 *
 * Coverage targets (spec: >80%):
 *   - passwordUtils: evaluatePasswordComplexity
 *   - PasswordInput: rendering, show/hide toggle, ARIA attributes, error state
 *   - PasswordStrengthBar: rendering, meter attributes, rule list
 *
 * Test runner: Jest + React Testing Library
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { evaluatePasswordComplexity } from './passwordUtils';
import PasswordInput from './PasswordInput';
import PasswordStrengthBar from './PasswordStrengthBar';

// ─── passwordUtils ────────────────────────────────────────────────────────────

describe('evaluatePasswordComplexity', () => {
  it('returns empty level for empty string', () => {
    const result = evaluatePasswordComplexity('');
    expect(result.level).toBe('empty');
    expect(result.score).toBe(0);
    expect(result.label).toBe('');
  });

  it('returns weak for a single lowercase letter', () => {
    const result = evaluatePasswordComplexity('a');
    expect(result.level).toBe('weak');
    expect(result.score).toBe(1); // only lowercase passes
  });

  it('returns fair when 3 rules pass', () => {
    // 8+ chars + lowercase + uppercase = 3 rules
    const result = evaluatePasswordComplexity('Abcdefgh');
    expect(result.score).toBe(3);
    expect(result.level).toBe('fair');
    expect(result.label).toBe('Fair');
  });

  it('returns good when 4 rules pass', () => {
    // 8+ chars + lowercase + uppercase + number = 4 rules
    const result = evaluatePasswordComplexity('Abcdefg1');
    expect(result.score).toBe(4);
    expect(result.level).toBe('good');
  });

  it('returns strong when all 5 rules pass', () => {
    const result = evaluatePasswordComplexity('Abcdefg1!');
    expect(result.score).toBe(5);
    expect(result.level).toBe('strong');
    expect(result.label).toBe('Strong');
  });

  it('marks individual rules correctly', () => {
    const result = evaluatePasswordComplexity('Abcdefg1!');
    const ruleMap = Object.fromEntries(result.rules.map((r) => [r.id, r.passed]));
    expect(ruleMap['min-length']).toBe(true);
    expect(ruleMap['uppercase']).toBe(true);
    expect(ruleMap['lowercase']).toBe(true);
    expect(ruleMap['number']).toBe(true);
    expect(ruleMap['special']).toBe(true);
  });

  it('fails min-length rule for short password', () => {
    const result = evaluatePasswordComplexity('Ab1!');
    const minLength = result.rules.find((r) => r.id === 'min-length');
    expect(minLength?.passed).toBe(false);
  });
});

// ─── PasswordInput ────────────────────────────────────────────────────────────

describe('PasswordInput', () => {
  it('renders a labelled password input', () => {
    render(<PasswordInput label="New Password" />);
    const input = screen.getByLabelText('New Password');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders the show/hide toggle button', () => {
    render(<PasswordInput label="Password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle).toBeInTheDocument();
  });

  it('toggle button has aria-pressed="false" initially', () => {
    render(<PasswordInput label="Password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking toggle reveals password (type becomes text)', async () => {
    render(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: /show password/i });

    await userEvent.click(toggle);

    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAccessibleName(/hide password/i);
  });

  it('clicking toggle again hides password', async () => {
    render(<PasswordInput label="Password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });

    await userEvent.click(toggle);
    await userEvent.click(toggle);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggle button is keyboard accessible (Enter key)', async () => {
    render(<PasswordInput label="Password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });

    toggle.focus();
    await userEvent.keyboard('{Enter}');

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('shows strength bar when showStrengthFeedback is true and value is non-empty', async () => {
    render(<PasswordInput label="Password" showStrengthFeedback value="Abcdefg1!" onChange={() => {}} />);
    // Strength bar renders a meter role
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });

  it('does not show strength bar when value is empty', () => {
    render(<PasswordInput label="Password" showStrengthFeedback value="" onChange={() => {}} />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });

  it('displays error message and sets aria-invalid', () => {
    render(<PasswordInput label="Password" errorMessage="Password is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Password is required');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('input is disabled when disabled prop is passed', () => {
    render(<PasswordInput label="Password" disabled />);
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /show password/i })).toBeDisabled();
  });

  it('calls onChange handler on input', async () => {
    const handleChange = jest.fn();
    render(<PasswordInput label="Password" onChange={handleChange} />);
    const input = screen.getByLabelText('Password');
    await userEvent.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('input has aria-controls pointing to the input id', () => {
    render(<PasswordInput label="Password" id="pw-field" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle).toHaveAttribute('aria-controls', 'pw-field');
  });
});

// ─── PasswordStrengthBar ──────────────────────────────────────────────────────

describe('PasswordStrengthBar', () => {
  it('renders nothing when level is empty', () => {
    const { container } = render(
      <PasswordStrengthBar complexity={evaluatePasswordComplexity('')} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders meter with correct aria attributes for a strong password', () => {
    const complexity = evaluatePasswordComplexity('Abcdefg1!');
    render(<PasswordStrengthBar complexity={complexity} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '5');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '5');
    expect(meter).toHaveAttribute('aria-valuetext', 'Strong');
  });

  it('renders rule list with all 5 rules', () => {
    const complexity = evaluatePasswordComplexity('Abcdefg1!');
    render(<PasswordStrengthBar complexity={complexity} />);

    const list = screen.getByRole('list', { name: /password requirements/i });
    expect(list.querySelectorAll('li')).toHaveLength(5);
  });

  it('marks passed rules with (met) for screen readers', () => {
    const complexity = evaluatePasswordComplexity('Abcdefg1!');
    render(<PasswordStrengthBar complexity={complexity} />);
    // All 5 rules pass – each should have "(met)" in the SR-only span
    const metItems = screen.getAllByText('(met)');
    expect(metItems).toHaveLength(5);
  });

  it('marks failed rules with (not met) for screen readers', () => {
    // Only lowercase passes for 'a'
    const complexity = evaluatePasswordComplexity('a');
    render(<PasswordStrengthBar complexity={complexity} />);
    const notMetItems = screen.getAllByText('(not met)');
    expect(notMetItems).toHaveLength(4);
  });

  it('has aria-live="polite" on the rule list for real-time announcements', () => {
    const complexity = evaluatePasswordComplexity('Abc');
    render(<PasswordStrengthBar complexity={complexity} />);
    const list = screen.getByRole('list', { name: /password requirements/i });
    expect(list).toHaveAttribute('aria-live', 'polite');
  });
});
