/**
 * ProfileEditForm.test.jsx
 *
 * Unit tests for the ProfileEditForm component and its validation helpers.
 * Uses React Testing Library + Jest (standard CRA / Vite test setup).
 *
 * Covers all acceptance criteria:
 *  1. UI displays fields for name, email, and password
 *  2. Input fields are validated for correct formats
 *  3. Changes are only accepted when validation passes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileEditForm, {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './ProfileEditForm';

// ---------------------------------------------------------------------------
// Validation helper unit tests
// ---------------------------------------------------------------------------

describe('validateName', () => {
  it('returns error for empty string', () => {
    expect(validateName('')).not.toBe('');
  });

  it('returns error for single character', () => {
    expect(validateName('A')).not.toBe('');
  });

  it('returns no error for a valid name', () => {
    expect(validateName('Jane Doe')).toBe('');
  });

  it('returns error for name longer than 50 characters', () => {
    expect(validateName('A'.repeat(51))).not.toBe('');
  });
});

describe('validateEmail', () => {
  it('returns error for empty string', () => {
    expect(validateEmail('')).not.toBe('');
  });

  it('returns error for missing @ symbol', () => {
    expect(validateEmail('notanemail')).not.toBe('');
  });

  it('returns error for missing domain', () => {
    expect(validateEmail('user@')).not.toBe('');
  });

  it('returns no error for a valid email', () => {
    expect(validateEmail('user@example.com')).toBe('');
  });
});

describe('validatePassword', () => {
  it('returns no error for empty password (no change)', () => {
    expect(validatePassword('')).toBe('');
  });

  it('returns error for password shorter than 8 characters', () => {
    expect(validatePassword('Ab1')).not.toBe('');
  });

  it('returns error when no uppercase letter', () => {
    expect(validatePassword('abcdefg1')).not.toBe('');
  });

  it('returns error when no lowercase letter', () => {
    expect(validatePassword('ABCDEFG1')).not.toBe('');
  });

  it('returns error when no digit', () => {
    expect(validatePassword('Abcdefgh')).not.toBe('');
  });

  it('returns no error for a valid password', () => {
    expect(validatePassword('Secure1Pass')).toBe('');
  });
});

describe('validateConfirmPassword', () => {
  it('returns no error when passwords match', () => {
    expect(validateConfirmPassword('Secure1Pass', 'Secure1Pass')).toBe('');
  });

  it('returns error when passwords do not match', () => {
    expect(validateConfirmPassword('Secure1Pass', 'Different1')).not.toBe('');
  });

  it('returns no error when password is empty (no change)', () => {
    expect(validateConfirmPassword('', '')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Component rendering tests
// ---------------------------------------------------------------------------

describe('ProfileEditForm component', () => {
  const setup = (props = {}) => render(<ProfileEditForm {...props} />);

  // AC-1: UI displays fields for name, email, and password
  it('renders name, email, and password fields', () => {
    setup();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
  });

  it('renders a Save Changes button', () => {
    setup();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('pre-populates fields from initialValues', () => {
    setup({ initialValues: { name: 'Alice', email: 'alice@example.com' } });
    expect(screen.getByLabelText(/name/i)).toHaveValue('Alice');
    expect(screen.getByLabelText(/email/i)).toHaveValue('alice@example.com');
  });

  // AC-2 & AC-3: Validation errors shown; form not submitted when invalid
  it('shows validation errors when submitting an empty form', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows email format error for invalid email', async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice');
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    fireEvent.blur(screen.getByLabelText(/email/i));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows password strength error for weak password', async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/new password/i), 'weak');
    fireEvent.blur(screen.getByLabelText(/new password/i));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('shows confirm-password mismatch error', async () => {
    setup();
    await userEvent.type(screen.getByLabelText(/new password/i), 'Secure1Pass');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'Different1');
    fireEvent.blur(screen.getByLabelText(/confirm new password/i));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  // AC-3: onSave is called only when validation passes
  it('calls onSave with correct payload when form is valid', async () => {
    const onSave = jest.fn().mockResolvedValue();
    setup({ initialValues: { name: 'Alice', email: 'alice@example.com' }, onSave });

    // Fields are pre-populated; just submit
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
    });
  });

  it('does NOT call onSave when form is invalid', async () => {
    const onSave = jest.fn();
    setup({ onSave });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('shows success message after a successful save', async () => {
    const onSave = jest.fn().mockResolvedValue();
    setup({ initialValues: { name: 'Alice', email: 'alice@example.com' }, onSave });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile has been updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error banner when onSave rejects', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Server error'));
    setup({ initialValues: { name: 'Alice', email: 'alice@example.com' }, onSave });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });
});
