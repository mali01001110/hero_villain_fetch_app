import { config, sanitizeError } from '@/config/env';
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
} from './errors';
import { normalizeCharacter } from './normalizer';
import { Character, RawCharacter, RawSearchResponse } from './types';

const DEFAULT_CONCURRENCY = 5;
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 300;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffForAttempt(attempt: number): number {
  const exponential = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
  return exponential + Math.floor(Math.random() * 100);
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('invalid-data', 'The superhero API returned an unreadable response.');
  }
}

function assertRawSuccess(data: RawCharacter | RawSearchResponse, context: string): void {
  if (data.response !== 'error') {
    return;
  }

  const message = data.error || 'The superhero API returned an error response.';
  if (isAccessDeniedMessage(message)) {
    throw new ApiError('auth', 'The superhero API token was rejected. Check the app configuration.');
  }
  if (isNotFoundMessage(message)) {
    throw httpError(404, context);
  }
  throw new ApiError('http', message);
}

/**
 * Fetch wrapper with timeout, exponential backoff with jitter, token redaction,
 * and retry handling for rate limits and transient server failures.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit | undefined,
  context: string,
  maxRetries = MAX_RETRIES
): Promise<Response> {
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    const externalSignal = init?.signal;
    const handleExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', handleExternalAbort);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });

      if (response.status === 429) {
        const retryAfterMs = parseRetryAfterMs(response.headers?.get?.('retry-after') ?? null);
        if (attempt < maxRetries) {
          attempt++;
          await sleep(retryAfterMs ?? backoffForAttempt(attempt));
          continue;
        }
        throw httpError(429, context, retryAfterMs);
      }

      if (isRetryableStatus(response.status) && attempt < maxRetries) {
        attempt++;
        await sleep(backoffForAttempt(attempt));
        continue;
      }

      return response;
    } catch (error) {
      if (isApiError(error)) {
        throw error;
      }
      if (externalSignal?.aborted) {
        throw new ApiError('aborted', 'Request aborted');
      }
      if (timedOut) {
        if (attempt < maxRetries) {
          attempt++;
          await sleep(backoffForAttempt(attempt));
          continue;
        }
        throw new ApiError('timeout', 'The request timed out. Please try again.');
      }
      if (attempt < maxRetries) {
        attempt++;
        await sleep(backoffForAttempt(attempt));
        continue;
      }
      throw new ApiError('network', 'Network request failed. Check your connection and try again.');
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', handleExternalAbort);
    }
  }
}

/**
 * Fetch a single character by ID (valid IDs: 1 to 731).
 */
export async function fetchCharacterById(
  id: number | string,
  signal?: AbortSignal
): Promise<Character> {
  const context = `Character #${id}`;
  const url = `${config.apiBaseUrl}/${id}`;

  try {
    const res = await fetchWithRetry(url, { signal }, context);
    if (!res.ok) {
      throw httpError(res.status, context);
    }

    const data = await readJson<RawCharacter>(res);
    assertRawSuccess(data, context);

    try {
      return normalizeCharacter(data);
    } catch (error) {
      if (isApiError(error)) {
        throw error;
      }
      throw new ApiError('invalid-data', sanitizeError(error));
    }
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiError('aborted', 'Request aborted');
    }
    throw toApiError(error);
  }
}

/**
 * Search characters by name using the /search/{name} endpoint.
 */
export async function searchCharactersByName(
  name: string,
  signal?: AbortSignal
): Promise<Character[]> {
  const trimmed = name.trim();
  if (!trimmed) {
    return [];
  }

  const context = `Search for "${trimmed}"`;
  const url = `${config.apiBaseUrl}/search/${encodeURIComponent(trimmed)}`;

  try {
    const res = await fetchWithRetry(url, { signal }, context);
    if (!res.ok) {
      throw httpError(res.status, context);
    }

    const data = await readJson<RawSearchResponse>(res);

    if (data.response === 'error') {
      const message = data.error || '';
      if (isAccessDeniedMessage(message)) {
        throw new ApiError('auth', 'The superhero API token was rejected. Check the app configuration.');
      }
      if (isNotFoundMessage(message)) {
        return [];
      }
      throw new ApiError('http', message || 'The search request failed.');
    }

    const rawList = Array.isArray(data.results) ? data.results : [];
    const characters: Character[] = [];

    for (const raw of rawList) {
      try {
        characters.push(normalizeCharacter(raw));
      } catch {
        // Skip malformed records in search results.
      }
    }

    if (rawList.length > 0 && characters.length === 0) {
      throw new ApiError('invalid-data', 'The search response contained no usable characters.');
    }

    return characters;
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiError('aborted', 'Request aborted');
    }
    throw toApiError(error);
  }
}

/**
 * Fetches a batch of characters by IDs with limited concurrency and backoff retry.
 * Individual missing/invalid IDs are skipped, but fatal auth/rate-limit failures
 * and all-failed batches are surfaced to the caller.
 */
export async function fetchCharactersBatch(
  ids: number[],
  concurrency = DEFAULT_CONCURRENCY,
  signal?: AbortSignal
): Promise<Character[]> {
  if (ids.length === 0) {
    return [];
  }

  const results: (Character | null)[] = new Array(ids.length).fill(null);
  let currentIndex = 0;
  let firstError: Error | null = null;
  let fatalError: Error | null = null;

  async function worker(): Promise<void> {
    while (currentIndex < ids.length && !fatalError) {
      if (signal?.aborted) {
        return;
      }
      const index = currentIndex++;
      const id = ids[index];
      try {
        results[index] = await fetchCharacterById(id, signal);
      } catch (error) {
        if (signal?.aborted) {
          return;
        }
        const apiError = toApiError(error);
        if (!firstError) {
          firstError = apiError;
        }
        if (isFatalApiError(apiError)) {
          fatalError = apiError;
          return;
        }
        results[index] = null;
      }
    }
  }

  const workerCount = Math.min(concurrency, ids.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (signal?.aborted) {
    throw new ApiError('aborted', 'Request aborted');
  }
  if (fatalError) {
    throw fatalError;
  }
  if (results.every((character) => character === null) && firstError) {
    throw firstError;
  }

  return results.filter((character): character is Character => character !== null);
}
