import {
  ApiError,
  httpError,
  isAccessDeniedMessage,
  isApiError,
  isFatalApiError,
  isNotFoundMessage,
  isRetryableStatus,
  parseRetryAfterMs,
  toApiError,
} from '../errors';

describe('api errors', () => {
  describe('ApiError', () => {
    it('sets kind, message, status, and retryAfterMs', () => {
      const err = new ApiError('auth', 'bad token', { status: 401, retryAfterMs: 100 });
      expect(err.name).toBe('ApiError');
      expect(err.kind).toBe('auth');
      expect(err.message).toBe('bad token');
      expect(err.status).toBe(401);
      expect(err.retryAfterMs).toBe(100);
    });
  });

  describe('isApiError / toApiError', () => {
    it('identifies ApiError instances', () => {
      expect(isApiError(new ApiError('network', 'offline'))).toBe(true);
      expect(isApiError(new Error('plain'))).toBe(false);
      expect(isApiError(null)).toBe(false);
    });

    it('passes through ApiError', () => {
      const err = new ApiError('auth', 'rejected');
      expect(toApiError(err)).toBe(err);
    });

    it('wraps plain errors as unknown', () => {
      const err = toApiError(new Error('boom'));
      expect(err.kind).toBe('unknown');
      expect(err.message).toBe('boom');
    });
  });

  describe('isFatalApiError', () => {
    it('returns true for auth, config, rate-limit', () => {
      expect(isFatalApiError(new ApiError('auth', 'x'))).toBe(true);
      expect(isFatalApiError(new ApiError('config', 'x'))).toBe(true);
      expect(isFatalApiError(new ApiError('rate-limit', 'x'))).toBe(true);
    });

    it('returns false for network, http, invalid-data, aborted', () => {
      expect(isFatalApiError(new ApiError('network', 'x'))).toBe(false);
      expect(isFatalApiError(new ApiError('http', 'x'))).toBe(false);
      expect(isFatalApiError(new ApiError('invalid-data', 'x'))).toBe(false);
      expect(isFatalApiError(new ApiError('aborted', 'x'))).toBe(false);
    });
  });

  describe('isAccessDeniedMessage', () => {
    it('matches access-denied messages', () => {
      expect(isAccessDeniedMessage('access denied')).toBe(true);
      expect(isAccessDeniedMessage('invalid token')).toBe(true);
      expect(isAccessDeniedMessage('invalid key')).toBe(true);
      expect(isAccessDeniedMessage('Unauthorized')).toBe(true);
      expect(isAccessDeniedMessage('Forbidden')).toBe(true);
      expect(isAccessDeniedMessage('authentication failed')).toBe(true);
    });

    it('returns false for unrelated messages', () => {
      expect(isAccessDeniedMessage('character not found')).toBe(false);
      expect(isAccessDeniedMessage('timeout')).toBe(false);
    });
  });

  describe('isNotFoundMessage', () => {
    it('matches not-found messages', () => {
      expect(isNotFoundMessage('character with given id not found')).toBe(true);
      expect(isNotFoundMessage('Not Found')).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(isNotFoundMessage('access denied')).toBe(false);
    });
  });

  describe('isRetryableStatus', () => {
    it('returns true for 408, 425, and 5xx', () => {
      expect(isRetryableStatus(408)).toBe(true);
      expect(isRetryableStatus(425)).toBe(true);
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
    });

    it('returns false for 4xx and success', () => {
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
      expect(isRetryableStatus(200)).toBe(false);
    });
  });

  describe('parseRetryAfterMs', () => {
    it('parses seconds', () => {
      expect(parseRetryAfterMs('120')).toBe(120000);
    });

    it('parses HTTP-date', () => {
      const future = new Date(Date.now() + 6000).toUTCString();
      const ms = parseRetryAfterMs(future);
      expect(ms).toBeGreaterThanOrEqual(5000);
      expect(ms).toBeLessThanOrEqual(7000);
    });

    it('returns undefined for invalid input', () => {
      expect(parseRetryAfterMs(null)).toBeUndefined();
      expect(parseRetryAfterMs('not-a-date')).toBeUndefined();
    });
  });

  describe('httpError', () => {
    it('maps 401/403 to auth', () => {
      expect(httpError(401, 'ctx').kind).toBe('auth');
      expect(httpError(403, 'ctx').kind).toBe('auth');
      expect(httpError(401, 'ctx').status).toBe(401);
    });

    it('maps 429 to rate-limit with retryAfterMs', () => {
      const err = httpError(429, 'ctx', 60000);
      expect(err.kind).toBe('rate-limit');
      expect(err.retryAfterMs).toBe(60000);
    });

    it('maps 404 to http', () => {
      expect(httpError(404, 'ctx').kind).toBe('http');
    });

    it('maps 5xx to http', () => {
      expect(httpError(500, 'ctx').kind).toBe('http');
    });
  });
});
