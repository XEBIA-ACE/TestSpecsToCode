/**
 * ProfileEditForm Component
 * Allows the authenticated user to update their name, email, and password.
 * Sends changes to the backend via profileApi and displays immediate feedback.
 */

import React, { useState } from 'react';
import { updateProfile } from '../api/profileApi';

/**
 * @param {{ user: { id, name, email }, authToken: string, onProfileUpdated?: (user) => void }} props
 */
function ProfileEditForm({ user, authToken, onProfileUpdated }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Client-side validation
    if (password && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const payload = {};
    if (name.trim()) payload.name = name.trim();
    if (email.trim()) payload.email = email.trim();
    if (password.trim()) payload.password = password.trim();

    if (Object.keys(payload).length === 0) {
      setErrorMessage('Please update at least one field before saving.');
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfile(payload, authToken);
      setSuccessMessage(result.message || 'Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
      if (onProfileUpdated && result.user) {
        onProfileUpdated(result.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Edit Profile Form" noValidate>
      <h2>Edit Profile</h2>

      {/* Success feedback */}
      {successMessage && (
        <div role="alert" className="alert alert--success" data-testid="success-message">
          {successMessage}
        </div>
      )}

      {/* Error feedback */}
      {errorMessage && (
        <div role="alert" className="alert alert--error" data-testid="error-message">
          {errorMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="profile-name">Name</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-password">New Password</label>
        <input
          id="profile-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-confirm-password">Confirm New Password</label>
        <input
          id="profile-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} data-testid="save-profile-btn">
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

export default ProfileEditForm;
