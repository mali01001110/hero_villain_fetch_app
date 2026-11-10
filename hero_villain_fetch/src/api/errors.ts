import { sanitizeError } from '@/config/env';

export type ApiErrorKind =
  | 'aborted'
  | 'auth'
  | 'config'
  | 'http'
  | 'invalid-data'
  | 'network'
  | 'rate-limit'
  | 'timeout'
  | 'unknown';

interface ApiErrorOptions {
  status?: number;
  retryAfterMs?: number;
}

/**
 * Typed error used across the API boundary so screens can distinguish a bad
 * token from an offline device, a missing character, or a temporary outage.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isFatalApiError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.kind === 'auth' || error.kind === 'config' || error.kind === 'rate-limit')
  );
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new ApiError('aborted', 'Request aborted');
    }
    return new ApiError('unknown', sanitizeError(error));
  }
  return new ApiError('unknown', sanitizeError(error));
}

export function isAccessDeniedMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('access denied') ||
    lower.includes('invalid token') ||
    lower.includes('invalid key') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('authentication')
  );
}

export function isNotFoundMessage(message: string): boolean {
  return message.toLowerCase().includes('not found');
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || (status >= 500 && status <= 599);
}

export function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const date = Date.parse(value);
  if (Number.isNaN(date)) {
    return undefined;
  }
  return Math.max(0, date - Date.now());
}

export function httpErrorMessage(status: number, context: string): string {
  if (status === 401 || status === 403) {
    return 'The superhero API token was rejected. Check the app configuration.';
  }
  if (status === 404) {
    return `${context} was not found.`;
  }
  if (status === 429) {
    return 'Too many requests to the superhero API. Please wait a moment and try again.';
  }
  if (status >= 500) {
    return 'The superhero API is temporarily unavailable. Please try again.';
  }
  return `Request failed with HTTP status ${status}.`;
}

export function httpError(status: number, context: string, retryAfterMs?: number): ApiError {
  if (status === 401 || status === 403) {
    return new ApiError('auth', httpErrorMessage(status, context), { status });
  }
  if (status === 429) {
    return new ApiError('rate-limit', httpErrorMessage(status, context), {
      status,
      retryAfterMs,
    });
  }
  return new ApiError('http', httpErrorMessage(status, context), { status });
}
