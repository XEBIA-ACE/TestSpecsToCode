```javascript
'use strict';

const { validateReturnUrl } = require('../src/adapters/inbound/http/authMiddleware');
const config = require('../src/config/env');

describe('returnUrl Validator', () => {
  const defaultLandingUrl = config.auth.defaultLandingUrl;
  const loginUrl = config.auth.loginUrl;

  describe('Valid relative paths', () => {
    it('should accept /api/v1/users/123', () => {
      const result = validateReturnUrl('/api/v1/users/123');
      expect(result).toBe('/api/v1/users/123');
    });

    it('should accept /dashboard', () => {
      const result = validateReturnUrl('/dashboard');
      expect(result).toBe('/dashboard');
    });

    it('should accept /', () => {
      const result = validateReturnUrl('/');
      expect(result).toBe('/');
    });

    it('should accept paths with query parameters', () => {
      const result = validateReturnUrl('/api/v1/users?page=1');
      expect(result).toBe('/api/v1/users?page=1');
    });

    it('should accept paths with hash fragments', () => {
      const result = validateReturnUrl('/dashboard#section');
      expect(result).toBe('/dashboard#section');
    });
  });

  describe('Absolute URL rejection', () => {
    it('should reject http://evil.com/path', () => {
      const result = validateReturnUrl('http://evil.com/path');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject https://evil.com/path', () => {
      const result = validateReturnUrl('https://evil.com/path');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject //evil.com/path (protocol-relative URL)', () => {
      const result = validateReturnUrl('//evil.com/path');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject ftp://evil.com/path', () => {
      const result = validateReturnUrl('ftp://evil.com/path');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject URLs with encoded protocols', () => {
      const result = validateReturnUrl('http%3A%2F%2Fevil.com%2Fpath');
      expect(result).toBe(defaultLandingUrl);
    });
  });

  describe('Protocol injection prevention', () => {
    it('should reject javascript:alert(1)', () => {
      const result = validateReturnUrl('javascript:alert(1)');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject data:text/html,...', () => {
      const result = validateReturnUrl('data:text/html,<script>alert(1)</script>');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject javascript: with mixed case', () => {
      const result = validateReturnUrl('JavaScript:alert(1)');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject javascript: with whitespace', () => {
      const result = validateReturnUrl('  javascript:alert(1)');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject vbscript: protocol', () => {
      const result = validateReturnUrl('vbscript:msgbox(1)');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject file: protocol', () => {
      const result = validateReturnUrl('file:///etc/passwd');
      expect(result).toBe(defaultLandingUrl);
    });
  });

  describe('Null/undefined/empty handling', () => {
    it('should return default landing URL for null', () => {
      const result = validateReturnUrl(null);
      expect(result).toBe(defaultLandingUrl);
    });

    it('should return default landing URL for undefined', () => {
      const result = validateReturnUrl(undefined);
      expect(result).toBe(defaultLandingUrl);
    });

    it('should return default landing URL for empty string', () => {
      const result = validateReturnUrl('');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should return default landing URL for whitespace only', () => {
      const result = validateReturnUrl('   ');
      expect(result).toBe(defaultLandingUrl);
    });
  });

  describe('Circular redirect prevention', () => {
    it('should return default landing URL when returnUrl is login URL', () => {
      const result = validateReturnUrl(loginUrl);
      expect(result).toBe(defaultLandingUrl);
    });

    it('should return default landing URL when returnUrl contains login path', () => {
      const result = validateReturnUrl('/api/v1/users/login');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should return default landing URL for login URL with query params', () => {
      const result = validateReturnUrl('/api/v1/users/login?foo=bar');
      expect(result).toBe(defaultLandingUrl);
    });
  });

  describe('Edge cases', () => {
    it('should reject paths not starting with /', () => {
      const result = validateReturnUrl('api/v1/users');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should reject backslash paths', () => {
      const result = validateReturnUrl('\\evil.com\\path');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should handle URL-encoded forward slashes', () => {
      // %2F is URL-encoded /
      const result = validateReturnUrl('%2Fapi%2Fv1%2Fusers');
      expect(result).toBe(defaultLandingUrl);
    });

    it('should accept valid paths with URL-safe special characters', () => {
      const result = validateReturnUrl('/api/v1/users/search?q=test&limit=10');
      expect(result).toBe('/api/v1/users/search?q=test&limit=10');
    });
  });
});
```