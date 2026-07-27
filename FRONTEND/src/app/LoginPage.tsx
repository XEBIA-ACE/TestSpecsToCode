/**
 * LoginPage.tsx
 *
 * Login page component for the Shopping App.
 *
 * Renders:
 *  - Legacy email/password login form (unchanged from original flow).
 *  - SSO sign-in button (only when VITE_SSO_ENABLED=true), which triggers
 *    the backend OAuth handshake via useSSOLogin.
 *
 * On SSO success: JWT is stored and the user is redirected to home/profile.
 * On SSO failure: a generic "Authentication failed. Please try again." message
 *   is displayed — no provider-specific or field-specific details are shown.
 *
 * Per spec (US-001): legacy login is fully preserved and unmodified.
 */

import React, { useState, FormEvent } from 'react';
import { useSSOLogin } from '../hooks/useSSOLogin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LegacyLoginFormState {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve the stored JWT (set by legacy login or SSO success handler).
 * Used to check if the user is already authenticated.
 */
export function getStoredToken(): string | null {
  return sessionStorage.getItem('auth_token');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LoginPage: React.FC = () => {
  // ── Legacy login state ────────────────────────────────────────────────────
  const [formState, setFormState] = useState<LegacyLoginFormState>({
    email: '',
    password: '',
    error: null,
    loading: false,
  });

  // ── SSO hook ──────────────────────────────────────────────────────────────
  const { ssoEnabled, loading: ssoLoading, error: ssoError, initiateSSO, clearError: clearSSOError } =
    useSSOLogin();

  // ── Legacy login handler (unchanged logic) ────────────────────────────────
  const handleLegacySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, error: null, loading: true }));

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
        }),
      });

      if (!response.ok) {
        // Keep error generic — do not expose field-level details.
        setFormState((prev) => ({
          ...prev,
          loading: false,
          error: 'Authentication failed. Please try again.',
        }));
        return;
      }

      const data = await response.json();
      const token: string = data.token ?? data.jwt ?? data.accessToken ?? '';

      if (token) {
        sessionStorage.setItem('auth_token', token);
        window.location.href = '/';
      } else {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          error: 'Authentication failed. Please try again.',
        }));
      }
    } catch {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: 'Authentication failed. Please try again.',
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="login-page" style={styles.page}>
      <div className="login-container" style={styles.container}>
        <h1 style={styles.heading}>Sign In</h1>

        {/* ── Legacy email/password form (fully preserved) ─────────────── */}
        <form
          onSubmit={handleLegacySubmit}
          aria-label="Legacy login form"
          style={styles.form}
          noValidate
        >
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formState.email}
              onChange={handleInputChange}
              style={styles.input}
              disabled={formState.loading}
              aria-required="true"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formState.password}
              onChange={handleInputChange}
              style={styles.input}
              disabled={formState.loading}
              aria-required="true"
            />
          </div>

          {/* Legacy login error — generic message only */}
          {formState.error && (
            <p role="alert" style={styles.errorText} aria-live="polite">
              {formState.error}
            </p>
          )}

          <button
            type="submit"
            disabled={formState.loading}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: formState.loading ? 0.6 : 1,
            }}
            aria-busy={formState.loading}
          >
            {formState.loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* ── SSO section (only rendered when VITE_SSO_ENABLED=true) ────── */}
        {ssoEnabled && (
          <>
            <div style={styles.divider} aria-hidden="true">
              <span style={styles.dividerText}>or</span>
            </div>

            {/* Generic SSO error — no provider or field details */}
            {ssoError && (
              <p
                role="alert"
                style={styles.errorText}
                aria-live="polite"
                data-testid="sso-error"
              >
                {ssoError}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                clearSSOError();
                initiateSSO();
              }}
              disabled={ssoLoading}
              style={{
                ...styles.button,
                ...styles.ssoButton,
                opacity: ssoLoading ? 0.6 : 1,
              }}
              aria-label="Sign in with SSO"
              aria-busy={ssoLoading}
              data-testid="sso-login-button"
            >
              {ssoLoading ? 'Redirecting…' : 'Sign in with SSO'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Minimal inline styles — replace with Tailwind/shadcn classes as needed.
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  container: {
    background: '#fff',
    borderRadius: 8,
    padding: '2rem',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  heading: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.625rem 1rem',
    border: 'none',
    borderRadius: 4,
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.15s',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    marginTop: '0.5rem',
  },
  ssoButton: {
    backgroundColor: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.25rem 0 1rem',
    gap: '0.75rem',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    flexShrink: 0,
    margin: '0 auto',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: '0.25rem 0',
  },
};

export default LoginPage;
