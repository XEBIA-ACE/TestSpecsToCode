/**
 * ProfileEditForm
 *
 * UI component for editing user profile information.
 * Displays fields for name, email, and password with client-side
 * validation. The "Save Changes" button is only enabled when all
 * validations pass.
 *
 * Acceptance criteria covered:
 *  - UI displays fields for name, email, and password
 *  - Input fields are validated for correct formats
 *  - Changes are only accepted when validation passes
 */

import React, { useState } from 'react';
import './ProfileEditForm.css';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validates a display name: non-empty, 2–50 characters.
 * @param {string} name
 * @returns {string} error message, or empty string when valid
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) return 'Name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (name.trim().length > 50) return 'Name must be 50 characters or fewer.';
  return '';
}

/**
 * Validates an e-mail address using a standard RFC-5322-inspired pattern.
 * @param {string} email
 * @returns {string} error message, or empty string when valid
 */
export function validateEmail(email) {
  if (!email || email.trim().length === 0) return 'Email is required.';
  // Basic but practical e-mail regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return '';
}

/**
 * Validates a new password.
 * Rules: at least 8 characters, one uppercase, one lowercase, one digit.
 * An empty password means "no change" and is therefore valid.
 * @param {string} password
 * @returns {string} error message, or empty string when valid
 */
export function validatePassword(password) {
  if (!password) return ''; // empty = no change requested
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one digit.';
  return '';
}

/**
 * Validates that the confirm-password field matches the new password.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string} error message, or empty string when valid
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (password && confirmPassword !== password) return 'Passwords do not match.';
  return '';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @param {object}   props
 * @param {object}   [props.initialValues]          - Pre-populated profile data
 * @param {string}   [props.initialValues.name]
 * @param {string}   [props.initialValues.email]
 * @param {Function} [props.onSave]                 - Called with { name, email, password }
 *                                                    when the form is submitted successfully.
 *                                                    Should return a Promise.
 */
function ProfileEditForm({ initialValues = {}, onSave }) {
  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialValues.name || '');
  const [email, setEmail] = useState(initialValues.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Touched state (show errors only after the user has interacted) ────────
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // ── Submission state ──────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  // ── Derived validation errors ─────────────────────────────────────────────
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  };

  const isFormValid =
    !errors.name && !errors.email && !errors.password && !errors.confirmPassword;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched so every error becomes visible
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!isFormValid) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setServerError('');

    try {
      const payload = { name: name.trim(), email: email.trim() };
      if (password) payload.password = password;

      if (typeof onSave === 'function') {
        await onSave(payload);
      }

      setSuccessMessage('Your profile has been updated successfully.');
      // Clear password fields after a successful save
      setPassword('');
      setConfirmPassword('');
      setTouched({ name: false, email: false, password: false, confirmPassword: false });
    } catch (err) {
      setServerError(
        err?.message || 'An error occurred while saving your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="profile-edit-container">
      <h2 className="profile-edit-title">Edit Profile</h2>

      {/* Success banner */}
      {successMessage && (
        <div className="profile-edit-alert profile-edit-alert--success" role="alert">
          {successMessage}
        </div>
      )}

      {/* Server-side error banner */}
      {serverError && (
        <div className="profile-edit-alert profile-edit-alert--error" role="alert">
          {serverError}
        </div>
      )}

      <form
        className="profile-edit-form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Profile edit form"
      >
        {/* ── Name ── */}
        <div className="form-group">
          <label htmlFor="profile-name" className="form-label">
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="profile-name"
            type="text"
            className={`form-input${touched.name && errors.name ? ' form-input--error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Your full name"
            autoComplete="name"
            aria-required="true"
            aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
          />
          {touched.name && errors.name && (
            <span id="name-error" className="form-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* ── Email ── */}
        <div className="form-group">
          <label htmlFor="profile-email" className="form-label">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="profile-email"
            type="email"
            className={`form-input${touched.email && errors.email ? ' form-input--error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="you@example.com"
            autoComplete="email"
            aria-required="true"
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
          />
          {touched.email && errors.email && (
            <span id="email-error" className="form-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* ── New Password ── */}
        <div className="form-group">
          <label htmlFor="profile-password" className="form-label">
            New Password{' '}
            <span className="form-label--hint">(leave blank to keep current)</span>
          </label>
          <input
            id="profile-password"
            type="password"
            className={`form-input${touched.password && errors.password ? ' form-input--error' : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
          />
          {touched.password && errors.password && (
            <span id="password-error" className="form-error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {/* ── Confirm Password ── */}
        <div className="form-group">
          <label htmlFor="profile-confirm-password" className="form-label">
            Confirm New Password
          </label>
          <input
            id="profile-confirm-password"
            type="password"
            className={`form-input${
              touched.confirmPassword && errors.confirmPassword ? ' form-input--error' : ''
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Repeat new password"
            autoComplete="new-password"
            aria-describedby={
              touched.confirmPassword && errors.confirmPassword
                ? 'confirm-password-error'
                : undefined
            }
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <span id="confirm-password-error" className="form-error" role="alert">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default ProfileEditForm;
