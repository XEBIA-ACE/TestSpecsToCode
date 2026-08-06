/**
 * Unit tests: ProfileEditForm component
 *
 * Verifies that the form:
 *  - renders all fields
 *  - calls the API with the correct payload
 *  - displays a success message on successful save
 *  - displays an error message on API failure
 *  - validates password confirmation client-side
 *
 * Run with: npx jest frontend/src/components/ProfileEditForm.test.jsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileEditForm from './ProfileEditForm';
import * as profileApi from '../api/profileApi';

jest.mock('../api/profileApi');

const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com' };
const mockToken = 'mock-jwt-token';

describe('ProfileEditForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders name, email, password, and confirm-password fields', () => {
    render(<ProfileEditForm user={mockUser} authToken={mockToken} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it('pre-fills name and email from the user prop', () => {
    render(<ProfileEditForm user={mockUser} authToken={mockToken} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue('Alice');
    expect(screen.getByLabelText(/email/i)).toHaveValue('alice@example.com');
  });

  it('sends profile changes to the correct API endpoint on submit', async () => {
    profileApi.updateProfile.mockResolvedValueOnce({
      success: true,
      message: 'Profile updated successfully.',
      user: { id: 1, name: 'Alice Updated', email: 'alice@example.com' },
    });

    render(<ProfileEditForm user={mockUser} authToken={mockToken} />);

    await userEvent.clear(screen.getByLabelText(/name/i));
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice Updated');
    fireEvent.click(screen.getByTestId('save-profile-btn'));

    await waitFor(() => {
      expect(profileApi.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice Updated' }),
        mockToken
      );
    });
  });

  it('displays a success message after a successful save', async () => {
    profileApi.updateProfile.mockResolvedValueOnce({
      success: true,
      message: 'Profile updated successfully.',
      user: { id: 1, name: 'Alice', email: 'alice@example.com' },
    });

    render(<ProfileEditForm user={mockUser} authToken={mockToken} />);
    fireEvent.click(screen.getByTestId('save-profile-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toHaveTextContent(
        /profile updated successfully/i
      );
    });
  });

  it('displays an error message when the API call fails', async () => {
    profileApi.updateProfile.mockRejectedValueOnce(
      new Error('The email address is already in use.')
    );

    render(<ProfileEditForm user={mockUser} authToken={mockToken} />);

    await userEvent.clear(screen.getByLabelText(/email/i));
    await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com');
    fireEvent.click(screen.getByTestId('save-profile-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        /already in use/i
      );
    });
  });

  it('shows a client-side error when passwords do not match', async () => {
    render(<ProfileEditForm user={mockUser} authToken={mockToken} />);

    await userEvent.type(screen.getByLabelText(/new password/i), 'Password1!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'Different1!');
    fireEvent.click(screen.getByTestId('save-profile-btn'));

    expect(screen.getByTestId('error-message')).toHaveTextContent(/passwords do not match/i);
    expect(profileApi.updateProfile).not.toHaveBeenCalled();
  });

  it('shows a client-side error when no fields are changed', async () => {
    render(<ProfileEditForm user={{ id: 1, name: '', email: '' }} authToken={mockToken} />);
    fireEvent.click(screen.getByTestId('save-profile-btn'));

    expect(screen.getByTestId('error-message')).toHaveTextContent(/at least one field/i);
    expect(profileApi.updateProfile).not.toHaveBeenCalled();
  });

  it('calls onProfileUpdated callback with updated user data', async () => {
    const updatedUser = { id: 1, name: 'Alice New', email: 'alice@example.com' };
    profileApi.updateProfile.mockResolvedValueOnce({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });

    const onProfileUpdated = jest.fn();
    render(
      <ProfileEditForm user={mockUser} authToken={mockToken} onProfileUpdated={onProfileUpdated} />
    );

    await userEvent.clear(screen.getByLabelText(/name/i));
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice New');
    fireEvent.click(screen.getByTestId('save-profile-btn'));

    await waitFor(() => {
      expect(onProfileUpdated).toHaveBeenCalledWith(updatedUser);
    });
  });
});
