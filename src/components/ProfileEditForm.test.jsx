/**
 * ProfileEditForm.test.jsx
 * Integration-level tests for the ProfileEditForm component.
 * Verifies real-time validation feedback, XSS sanitization, and submit behaviour.
 *
 * Uses React Testing Library (RTL) + Jest.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileEditForm from '../components/ProfileEditForm';

const mockProfile = {
  name: 'Alice Smith',
  email: 'alice@example.com',
  registrationDate: '2023-01-15',
  accountStatus: 'Active',
};

function renderForm(overrides = {}) {
  const onSave = jest.fn().mockResolvedValue(undefined);
  const props = { profile: mockProfile, onSave, ...overrides };
  const utils = render(<ProfileEditForm {...props} />);
  return { ...utils, onSave };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe('ProfileEditForm — rendering', () => {
  test('renders the Name input pre-filled with the profile name', () => {
    renderForm();
    expect(screen.getByLabelText(/name/i)).toHaveValue('Alice Smith');
  });

  test('renders read-only Email, Registration Date, and Account Status fields', () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('readOnly');
    expect(screen.getByLabelText(/registration date/i)).toHaveAttribute('readOnly');
    expect(screen.getByLabelText(/account status/i)).toHaveAttribute('readOnly');
  });

  test('Save button is enabled for a valid initial name', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Real-time validation feedback
// ---------------------------------------------------------------------------
describe('ProfileEditForm — real-time validation', () => {
  test('shows no error before the field is touched', () => {
    renderForm();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows error after blur when name is empty', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    await userEvent.clear(input);
    fireEvent.blur(input);
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
  });

  test('shows error in real-time when name is too short (after touch)', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    fireEvent.blur(input); // mark as touched
    await userEvent.clear(input);
    await userEvent.type(input, 'A');
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least/i);
  });

  test('shows error when name contains disallowed characters', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    fireEvent.blur(input);
    await userEvent.clear(input);
    await userEvent.type(input, 'Alice123');
    expect(await screen.findByRole('alert')).toHaveTextContent(/only contain/i);
  });

  test('clears error when a valid name is entered', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    fireEvent.blur(input);
    await userEvent.clear(input);
    await userEvent.type(input, 'A'); // invalid
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'Alice'); // valid
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('disables Save button when name is invalid', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    await userEvent.clear(input);
    fireEvent.blur(input);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// XSS sanitization
// ---------------------------------------------------------------------------
describe('ProfileEditForm — XSS sanitization', () => {
  test('strips HTML tags from the Name input on change', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    await userEvent.clear(input);
    // Simulate pasting an XSS payload
    fireEvent.change(input, { target: { value: '<script>alert(1)</script>' } });
    // The displayed value should not contain the script tag
    expect(input.value).not.toContain('<script>');
  });

  test('strips inline event handlers from the Name input', async () => {
    renderForm();
    const input = screen.getByLabelText(/name/i);
    fireEvent.change(input, {
      target: { value: '<img onerror="evil()" src=x>' },
    });
    expect(input.value).not.toContain('onerror');
  });
});

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------
describe('ProfileEditForm — submission', () => {
  test('calls onSave with sanitized name on valid submit', async () => {
    const { onSave } = renderForm();
    const input = screen.getByLabelText(/name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Bob Jones');
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ name: 'Bob Jones' });
    });
  });

  test('does not call onSave when name is invalid', async () => {
    const { onSave } = renderForm();
    const input = screen.getByLabelText(/name/i);
    await userEvent.clear(input);
    fireEvent.blur(input);
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  test('shows success message after successful save', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();
  });

  test('shows error message when onSave rejects', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<ProfileEditForm profile={mockProfile} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to save/i);
  });
});
