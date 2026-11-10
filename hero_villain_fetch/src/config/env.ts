/**
 * Single application configuration module.
 * Reads environment variables and exports sanitized configuration.
 */

function getToken(): string {
  return process.env.EXPO_PUBLIC_SUPERHERO_TOKEN?.trim() || '';
}

export const config = {
  get superheroToken(): string {
    return getToken();
  },
  get apiBaseUrl(): string {
    const token = getToken();
    if (!token) {
      throw new Error('API token is not configured. Please set EXPO_PUBLIC_SUPERHERO_TOKEN.');
    }
    return `https://superheroapi.com/api/${token}`;
  },
  isTokenConfigured(): boolean {
    return getToken().length > 0;
  },
};

/**
 * Redacts the API token from any string, URL, log, or error message.
 */
export function redactToken(message: string): string {
  const token = getToken();
  if (!token || !message) {
    return message;
  }
  return message.split(token).join('[REDACTED_TOKEN]');
}

/**
 * Formats a safe error message with all sensitive token data redacted.
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return redactToken(error.message);
  }
  return redactToken(String(error));
}
