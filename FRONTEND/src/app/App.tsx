/**
 * App.tsx
 *
 * Root application component for the Shopping App frontend.
 *
 * Routing strategy (minimal — extend with React Router if the project grows):
 *  - /sso/callback  → handled inline (reads query params and delegates to
 *                     useSSOLogin's effect in LoginPage)
 *  - /              → LoginPage (which renders legacy login + optional SSO button)
 *
 * SSO integration notes (US-001):
 *  - The SSO button is rendered inside LoginPage and is gated by VITE_SSO_ENABLED.
 *  - On SSO success the JWT is stored in sessionStorage and the user is
 *    redirected to the home/profile route.
 *  - On SSO failure a generic "Authentication failed. Please try again." message
 *    is shown — no provider or field details are ever surfaced.
 *  - Legacy email/password login is fully preserved and unmodified.
 */

import React from 'react';
import LoginPage from './LoginPage';

const App: React.FC = () => {
  // Simple path-based routing without an external router dependency.
  // The SSO callback query params (sso_token / sso_error) are consumed by the
  // useSSOLogin hook inside LoginPage, so we always render LoginPage for now.
  // TODO: Replace with React Router <Routes> when additional pages are added.
  return <LoginPage />;
};

export default App;
