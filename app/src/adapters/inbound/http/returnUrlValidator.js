```javascript
'use strict';

/**
 * Validates a return URL to prevent open redirect attacks.
 * Only allows relative paths that start with '/'.
 * Rejects absolute URLs, protocol-relative URLs, and any URL containing
 * protocol schemes or domain names.
 *
 * @param {string|null|undefined} url - The URL to validate
 * @returns {string|null} - The validated URL if valid, null otherwise
 */
function validateReturnUrl(url) {
  // Handle null, undefined, or non-string values
  if (url === null || url === undefined || typeof url !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Reject empty strings
  if (trimmedUrl.length === 0) {
    return null;
  }

  // Must start with a single forward slash (relative path)
  if (!trimmedUrl.startsWith('/')) {
    return null;
  }

  // Reject protocol-relative URLs (e.g., //evil.com)
  if (trimmedUrl.startsWith('//')) {
    return null;
  }

  // Reject URLs containing protocol schemes
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmedUrl)) {
    return null;
  }

  // Reject URLs with encoded protocol schemes
  if (/%[0-9a-fA-F]{2}/.test(trimmedUrl)) {
    // Decode and check for protocol schemes
    try {
      const decoded = decodeURIComponent(trimmedUrl);
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(decoded)) {
        return null;
      }
      // Also reject if decoded version starts with //
      if (decoded.startsWith('//')) {
        return null;
      }
    } catch (e) {
      // If decoding fails, reject the URL
      return null;
    }
  }

  // Reject URLs containing backslashes (potential bypass)
  if (trimmedUrl.includes('\\')) {
    return null;
  }

  // Reject URLs pointing to login page (prevent circular redirect)
  const loginPaths = ['/api/v1/users/login', '/login'];
  const urlPath = trimmedUrl.split('?')[0].toLowerCase();
  if (loginPaths.some(loginPath => urlPath === loginPath || urlPath.startsWith(loginPath + '/'))) {
    return null;
  }

  // Reject URLs with newlines or carriage returns (header injection)
  if (/[\r\n]/.test(trimmedUrl)) {
    return null;
  }

  return trimmedUrl;
}

module.exports = { validateReturnUrl };
```