import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCharacterById, fetchCharactersBatch, searchCharactersByName } from '@/api/client';
import { ApiError, toApiError } from '@/api/errors';
import { Character } from '@/api/types';
import { AlignmentFilter } from '@/components/FilterChips';

export const BATCH_SIZE = 20;
export const MAX_CHARACTER_ID = 731;
export const MIN_SCREEN_MATCHES = 10;

/**
 * Hook to fetch a single character by ID with infinite stale time.
 */
export function useCharacter(id: number | string) {
  const numericId = typeof id === 'number' ? id : Number(id);
  const isValidId =
    Number.isInteger(numericId) && numericId >= 1 && numericId <= MAX_CHARACTER_ID;

  return useQuery({
    queryKey: ['character', String(id)],
    queryFn: ({ signal }) => fetchCharacterById(numericId, signal),
    enabled: isValidId,
  });
}

/**
 * Debounce hook for smooth search input handling.
 */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debounced;
}

/**
 * Hook to search characters using the /search/{name} endpoint.
 */
export function useSearchCharacters(rawQuery: string) {
  const queryClient = useQueryClient();
  const debouncedQuery = useDebounce(rawQuery.trim());

  const query = useQuery({
    queryKey: ['characters', 'search', debouncedQuery],
    queryFn: async ({ signal }) => {
      const results = await searchCharactersByName(debouncedQuery, signal);
      for (const character of results) {
        queryClient.setQueryData(['character', String(character.id)], character);
      }
      return results;
    },
    enabled: debouncedQuery.length > 0,
  });

  const isWaitingForDebounce =
    rawQuery.trim().length > 0 && rawQuery.trim() !== debouncedQuery;

  return {
    ...query,
    debouncedQuery,
    isSearching:
      rawQuery.trim().length > 0 && (isWaitingForDebounce || query.isFetching),
  };
}

/**
 * Hook for browsing IDs 1..731 in batches of 20 with limited concurrency.
 * Persists each fetched character in TanStack Query.
 * When an alignment filter is active, automatically loads further batches until
 * enough matches fill the screen or IDs run out (731).
 */
export function useInfiniteCharacters(filter: AlignmentFilter) {
  const queryClient = useQueryClient();
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [currentMaxId, setCurrentMaxId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      activeControllerRef.current?.abort();
    };
  }, []);

  const filteredCharacters = allCharacters.filter((character) => {
    if (filter === 'All') return true;
    return character.biography.alignment === filter;
  });

  const hasMore = currentMaxId < MAX_CHARACTER_ID;

  const loadNextBatch = useCallback(
    async (fromId: number, isInitial = false, force = false) => {
      if (fromId > MAX_CHARACTER_ID || !isMountedRef.current) {
        return;
      }
      if (inFlightRef.current && !force) {
        return;
      }
      if (force) {
        activeControllerRef.current?.abort();
        inFlightRef.current = false;
      }

      const requestId = ++requestIdRef.current;
      const controller = new AbortController();
      activeControllerRef.current = controller;
      inFlightRef.current = true;

      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const toId = Math.min(fromId + BATCH_SIZE - 1, MAX_CHARACTER_ID);
      const idsToFetch: number[] = [];
      const cachedCharacters: Character[] = [];

      for (let id = fromId; id <= toId; id++) {
        const cached = queryClient.getQueryData<Character>(['character', String(id)]);
        if (cached) {
          cachedCharacters.push(cached);
        } else {
          idsToFetch.push(id);
        }
      }

      const isCurrent = () =>
        isMountedRef.current &&
        requestIdRef.current === requestId &&
        !controller.signal.aborted;

      try {
        let fetched: Character[] = [];
        if (idsToFetch.length > 0) {
          fetched = await fetchCharactersBatch(idsToFetch, 5, controller.signal);
          for (const character of fetched) {
            queryClient.setQueryData(['character', String(character.id)], character);
          }
        }

        if (isCurrent()) {
          const combined = [...cachedCharacters, ...fetched].sort((a, b) => a.id - b.id);
          setAllCharacters((previous) => {
            const existingIds = new Set(previous.map((character) => character.id));
            const newCharacters = combined.filter(
              (character) => !existingIds.has(character.id)
            );
            return [...previous, ...newCharacters].sort((a, b) => a.id - b.id);
          });
          setCurrentMaxId(toId);
        }
      } catch (caught) {
        if (isCurrent()) {
          setError(toApiError(caught));
        }
      } finally {
        if (activeControllerRef.current === controller) {
          inFlightRef.current = false;
          if (isMountedRef.current) {
            setIsLoading(false);
            setIsLoadingMore(false);
          }
        }
      }
    },
    [queryClient]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadNextBatch(1, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadNextBatch]);

  useEffect(() => {
    if (
      filter !== 'All' &&
      !isLoading &&
      !isLoadingMore &&
      !error &&
      hasMore &&
      filteredCharacters.length < MIN_SCREEN_MATCHES
    ) {
      const timer = setTimeout(() => {
        void loadNextBatch(currentMaxId + 1, false);
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    filter,
    filteredCharacters.length,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    currentMaxId,
    loadNextBatch,
  ]);

  const loadMore = useCallback(() => {
    if (!inFlightRef.current && hasMore) {
      void loadNextBatch(currentMaxId + 1, false);
    }
  }, [hasMore, currentMaxId, loadNextBatch]);

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    setAllCharacters([]);
    setCurrentMaxId(0);
    setError(null);
    await loadNextBatch(1, true, true);
    if (isMountedRef.current) {
      setIsRefreshing(false);
    }
  }, [loadNextBatch]);

  return {
    characters: filteredCharacters,
    totalLoadedCount: allCharacters.length,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
