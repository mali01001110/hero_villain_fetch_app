import { config, redactToken, sanitizeError } from '../env';

describe('Environment Config', () => {
  it('has superheroToken available or handles missing token safely', () => {
    expect(typeof config.isTokenConfigured()).toBe('boolean');
  });

  it('redacts tokens from messages and URLs', () => {
    if (config.superheroToken) {
      const sensitiveUrl = `https://superheroapi.com/api/${config.superheroToken}/1`;
      const sanitized = redactToken(sensitiveUrl);
      expect(sanitized).not.toContain(config.superheroToken);
      expect(sanitized).toContain('[REDACTED_TOKEN]');
    } else {
      expect(redactToken('plain text')).toBe('plain text');
    }
  });

  it('sanitizes Error objects properly', () => {
    if (config.superheroToken) {
      const err = new Error(`Failed to fetch from /api/${config.superheroToken}/1`);
      const sanitized = sanitizeError(err);
      expect(sanitized).not.toContain(config.superheroToken);
      expect(sanitized).toContain('[REDACTED_TOKEN]');
    } else {
      expect(sanitizeError(new Error('general error'))).toBe('general error');
    }
  });
});
