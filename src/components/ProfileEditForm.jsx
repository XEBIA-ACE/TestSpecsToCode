/**
 * ProfileEditForm.jsx
 * Profile editing component with real-time Name field validation.
 *
 * Behaviour (per spec.md):
 *   - Name field: editable, validated in real-time on every keystroke (onChange)
 *     and on blur.
 *   - Email, Registration Date, Account Status: read-only display fields.
 *   - Validation feedback is shown inline beneath the Name input.
 *   - Submit is disabled while the Name value is invalid.
 *   - WCAG 2.1 AA: labels, aria-describedby, aria-invalid, role="alert".
 */

import React, { useState, useCallback } from 'react';
import { sanitizeAndValidateName } from '../utils/nameValidation';

/**
 * @param {object}   props
 * @param {object}   props.profile          - Current user profile data
 * @param {string}   props.profile.name
 * @param {string}   props.profile.email
 * @param {string}   props.profile.registrationDate
 * @param {string}   props.profile.accountStatus
 * @param {Function} props.onSave           - Called with { name } when form is submitted
 */
export default function ProfileEditForm({ profile, onSave }) {
  const [nameInput, setNameInput] = useState(profile?.name ?? '');
  const [nameError, setNameError] = useState(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // -------------------------------------------------------------------------
  // Real-time validation handler (fires on every keystroke)
  // -------------------------------------------------------------------------
  const handleNameChange = useCallback((e) => {
    const raw = e.target.value;
    const { sanitized, error } = sanitizeAndValidateName(raw);

    // Update the displayed value with the sanitized version only if XSS
    // content was stripped; otherwise keep the raw value so the cursor
    // position is not disrupted during normal typing.
    const displayValue = sanitized !== raw ? sanitized : raw;

    setNameInput(displayValue);
    // Show errors only after the field has been touched at least once
    if (nameTouched) {
      setNameError(error);
    }
    setSaveSuccess(false);
  }, [nameTouched]);

  // -------------------------------------------------------------------------
  // Blur handler — mark field as touched and run validation
  // -------------------------------------------------------------------------
  const handleNameBlur = useCallback(() => {
    setNameTouched(true);
    const { error } = sanitizeAndValidateName(nameInput);
    setNameError(error);
  }, [nameInput]);

  // -------------------------------------------------------------------------
  // Form submission
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setNameTouched(true);

      const { sanitized, valid, error } = sanitizeAndValidateName(nameInput);
      setNameError(error);

      if (!valid) return;

      setIsSaving(true);
      try {
        await onSave({ name: sanitized });
        setSaveSuccess(true);
      } catch (err) {
        setNameError('Failed to save. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [nameInput, onSave]
  );

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const { valid: nameIsValid } = sanitizeAndValidateName(nameInput);
  const errorId = 'name-error';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Edit profile"
      className="profile-edit-form"
    >
      <h2>Profile</h2>

      {/* ------------------------------------------------------------------ */}
      {/* Editable: Name                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="form-group">
        <label htmlFor="profile-name">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="profile-name"
          type="text"
          value={nameInput}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          aria-required="true"
          aria-invalid={nameTouched && !!nameError ? 'true' : 'false'}
          aria-describedby={nameError ? errorId : undefined}
          maxLength={100}
          autoComplete="name"
          disabled={isSaving}
          className={`form-control${nameTouched && nameError ? ' is-invalid' : ''}${nameTouched && !nameError ? ' is-valid' : ''}`}
        />
        {nameTouched && nameError && (
          <span
            id={errorId}
            role="alert"
            aria-live="polite"
            className="field-error"
          >
            {nameError}
          </span>
        )}
        {nameTouched && !nameError && nameInput.trim().length > 0 && (
          <span className="field-success" aria-live="polite">
            Name looks good.
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Read-only fields                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="form-group">
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={profile?.email ?? ''}
          readOnly
          aria-readonly="true"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-registration-date">Registration Date</label>
        <input
          id="profile-registration-date"
          type="text"
          value={profile?.registrationDate ?? ''}
          readOnly
          aria-readonly="true"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-account-status">Account Status</label>
        <input
          id="profile-account-status"
          type="text"
          value={profile?.accountStatus ?? ''}
          readOnly
          aria-readonly="true"
          className="form-control"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Save feedback                                                        */}
      {/* ------------------------------------------------------------------ */}
      {saveSuccess && (
        <p role="status" aria-live="polite" className="save-success">
          Profile updated successfully. A confirmation email has been sent.
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Submit                                                               */}
      {/* ------------------------------------------------------------------ */}
      <button
        type="submit"
        disabled={isSaving || !nameIsValid}
        aria-disabled={isSaving || !nameIsValid ? 'true' : 'false'}
        className="btn btn-primary"
      >
        {isSaving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
