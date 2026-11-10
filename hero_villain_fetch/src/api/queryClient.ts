import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { isApiError } from './errors';

const CACHE_KEY = 'HERO_VILLAIN_QUERY_CACHE';
const CACHE_BUSTER = 'v2';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error)) {
    if (
      error.kind === 'aborted' ||
      error.kind === 'auth' ||
      error.kind === 'config' ||
      error.kind === 'invalid-data'
    ) {
      return false;
    }
  }
  return failureCount < 1;
}

/**
 * SuperHero characters are static reference data.
 * Cache each character indefinitely (staleTime: Infinity) and persist to AsyncStorage
 * so the 731 individual network calls are never repeated across sessions.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
  throttleTime: 1000,
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: Infinity,
  buster: CACHE_BUSTER,
};
