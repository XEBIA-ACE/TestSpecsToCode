/**
 * useSSOLogin.ts
 *
 * Custom hook encapsulating the SSO login flow.
 * Triggers the backend SSO OAuth redirect endpoint and handles the callback
 * result: on success stores the JWT and redirects to home/profile;
 * on failure surfaces a generic error message (no provider-specific details).
 *
 * The backend SSO endpoint is: /api/v1/auth/sso
 * SSO is only active when the env var VITE_SSO_ENABLED=true is set.
 */

import { useState, useEffect, useCallback } from 'react';

// Backend SSO redirect endpoint — triggers the OAuth handshake server-side.
const SSO_BACKEND_URL =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SSO_BACKEND_URL ||
  '/api/v1/auth/sso';

// Key used to persist the JWT in sessionStorage (mirrors existing auth storage).
const JWT_STORAGE_KEY = 'auth_token';

// Generic error message per spec — never reveal provider or field details.
const GENERIC_AUTH_ERROR = 'Authentication failed. Please try again.';

export interface UseSSOLoginReturn {
  /** Whether the SSO feature is enabled via configuration. */
  ssoEnabled: boolean;
  /** Whether an SSO sign-in attempt is currently in progress. */
  loading: boolean;
  /** Generic error message on failure, or null when no error. */
  error: string | null;
  /** Initiate the SSO sign-in flow (redirect or popup). */
  initiateSSO: () => void;
  /** Clear any current error state. */
  clearError: () => void;
}

/**
 * Reads the SSO-enabled flag from Vite env (VITE_SSO_ENABLED).
 * Defaults to false so SSO is opt-in.
 */
function isSSOEnabled(): boolean {
  const env = (import.meta as unknown as { env: Record<string, string> }).env;
  return env?.VITE_SSO_ENABLED === 'true';
}

/**
 * Store the JWT from a successful SSO callback and redirect to the home page.
 */
function handleSSOSuccess(token: string): void {
  // Store token using the same key as the legacy login flow.
  sessionStorage.setItem(JWT_STORAGE_KEY, token);
  // Redirect to profile/home — adjust path to match the app's routing.
  window.location.href = '/';
}

export function useSSOLogin(): UseSSOLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ssoEnabled = isSSOEnabled();

  /**
   * Handle the SSO callback result delivered via postMessage from a popup,
   * or via URL query params after a redirect.
   *
   * The backend is expected to:
   *   - On success: redirect to <frontend_origin>/sso/callback?token=<jwt>
   *   - On failure: redirect to <frontend_origin>/sso/callback?error=1
   */
  useEffect(() => {
    // Handle redirect-based callback: check URL query params on mount.
    const params = new URLSearchParams(window.location.search);
    const token = params.get('sso_token');
    const ssoError = params.get('sso_error');

    if (token) {
      // Clean the query params from the URL without a full page reload.
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      handleSSOSuccess(token);
    } else if (ssoError) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      setError(GENERIC_AUTH_ERROR);
    }

    // Handle popup-based callback via postMessage.
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the same origin.
      if (event.origin !== window.location.origin) return;

      const { type, token: msgToken } = event.data ?? {};

      if (type === 'SSO_SUCCESS' && msgToken) {
        setLoading(false);
        handleSSOSuccess(msgToken);
      } else if (type === 'SSO_FAILURE') {
        setLoading(false);
        // Display only the generic error — no provider or field details.
        setError(GENERIC_AUTH_ERROR);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * Initiate the SSO flow.
   * Opens the backend SSO endpoint in a popup so the main page state is
   * preserved. Falls back to a full redirect if popups are blocked.
   */
  const initiateSSO = useCallback(() => {
    if (!ssoEnabled) return;

    setError(null);
    setLoading(true);

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      SSO_BACKEND_URL,
      'sso_login',
      `width=${width},height=${height},left=${left},top=${top},` +
        'toolbar=no,menubar=no,scrollbars=yes,resizable=yes',
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Popup was blocked — fall back to full-page redirect.
      window.location.href = SSO_BACKEND_URL;
      return;
    }

    // Poll the popup to detect if the user closed it without completing auth.
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        setLoading(false);
        // Only set error if we haven't already received a success/failure message.
        setError((prev) => (prev === null ? GENERIC_AUTH_ERROR : prev));
      }
    }, 500);
  }, [ssoEnabled]);

  const clearError = useCallback(() => setError(null), []);

  return { ssoEnabled, loading, error, initiateSSO, clearError };
}
