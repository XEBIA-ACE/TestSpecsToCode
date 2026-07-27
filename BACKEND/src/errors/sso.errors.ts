/**
 * sso.errors.ts
 *
 * Domain errors for the SSO (Single Sign-On) authentication flow.
 *
 * Per constitution.md and spec US-001 AC-2:
 *  - Any SsoAuthenticationException is caught by the centralized error handler
 *    in app.ts and converted into a generic 401 response.
 *  - Provider-specific details must NEVER be included in the public message.
 *  - Internal reason is stored on the error for structured logging only —
 *    it must not be forwarded to the HTTP response.
 */

export class SsoAuthenticationException extends Error {
  /**
   * Internal reason code for structured logging.
   * Never expose this in HTTP responses.
   */
  public readonly internalReason: string;

  constructor(internalReason: string = 'SSO authentication failed') {
    // The public message is always generic (non-revealing) as required by
    // spec US-001 AC-2: "Authentication failed. Please try again."
    super('Authentication failed. Please try again.');
    this.name = 'SsoAuthenticationException';
    this.internalReason = internalReason;

    // Maintains proper prototype chain in transpiled ES5 output.
    Object.setPrototypeOf(this, SsoAuthenticationException.prototype);
  }
}
