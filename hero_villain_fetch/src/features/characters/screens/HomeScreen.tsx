import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import { Character } from '@/api/types';
import { AlignmentFilter, FilterChips } from '@/components/FilterChips';
import { EmptyState, ErrorState, OfflineNotice } from '@/components/OfflineNotice';
import { SearchBar } from '@/components/SearchBar';
import { GridSkeleton } from '@/components/SkeletonLoader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CharacterCard } from '@/features/characters/components/CharacterCard';
import { useInfiniteCharacters, useSearchCharacters } from '@/features/characters/hooks/useCharacters';
import { useAccessibilityAnnouncement } from '@/hooks/useAccessibilityAnnouncement';
import { SPACING, useTheme } from '@/theme/ThemeContext';

export function HomeScreen() {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const networkState = Network.useNetworkState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AlignmentFilter>('All');

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    debouncedQuery,
    refetch: refetchSearch,
  } = useSearchCharacters(searchQuery);

  const {
    characters: browseCharacters,
    isLoading: isBrowseLoading,
    isLoadingMore,
    isRefreshing,
    error: browseError,
    hasMore,
    loadMore,
    refetch,
  } = useInfiniteCharacters(selectedFilter);

  const isSearching = debouncedQuery.length > 0;
  const isOffline =
    networkState.isConnected === false || networkState.isInternetReachable === false;

  const filteredSearchResults = (searchResults || []).filter((character) => {
    if (selectedFilter === 'All') return true;
    return character.biography.alignment === selectedFilter;
  });

  const displayCharacters = isSearching ? filteredSearchResults : browseCharacters;
  const isLoading = isSearching ? isSearchLoading : isBrowseLoading;
  const error = isSearching ? searchError : browseError;
  const isOfflineEmpty = isOffline && !isLoading && displayCharacters.length === 0;

  const retryCurrentView = useCallback(() => {
    if (isSearching) {
      void refetchSearch();
    } else {
      void refetch();
    }
  }, [isSearching, refetch, refetchSearch]);

  const announcement = useMemo(() => {
    if (isLoading) {
      return isSearching ? 'Searching characters' : 'Loading characters';
    }
    if (error) {
      return 'Could not load characters. Check your connection and try again.';
    }
    if (isSearching) {
      if (displayCharacters.length === 0) {
        return `No results for ${debouncedQuery}`;
      }
      return `${displayCharacters.length} results for ${debouncedQuery}`;
    }
    return null;
  }, [isLoading, isSearching, error, displayCharacters.length, debouncedQuery]);

  useAccessibilityAnnouncement(announcement);

  const renderItem = useCallback(({ item }: { item: Character }) => {
    return (
      <View style={styles.gridItem}>
        <CharacterCard character={item} />
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Character) => String(item.id), []);

  const handleEndReached = useCallback(() => {
    if (!isSearching && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [isSearching, hasMore, isLoadingMore, loadMore]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedFilter('All');
  }, []);

  const showBanner = isOffline || (error && !isLoading);
  const bannerMessage = isOffline
    ? 'You are offline. Showing saved characters when available.'
    : 'Connection issue. Tap to retry loading.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: tokens.border }]}>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.wordmark, { color: tokens.text }]}
            accessibilityRole="header"
          >
            HERO/VILLAIN FETCH
          </Text>
        </View>
        <ThemeToggle />
      </View>

      <View style={styles.controlsSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
        />
        <FilterChips
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </View>

      {showBanner && (
        <View style={styles.bannerContainer}>
          <OfflineNotice message={bannerMessage} onRetry={retryCurrentView} />
        </View>
      )}

      {isLoading ? (
        <View style={[styles.contentPadding, { paddingBottom: insets.bottom + SPACING.md }]}>
          <GridSkeleton count={6} />
        </View>
      ) : (error || isOfflineEmpty) && displayCharacters.length === 0 ? (
        <ErrorState
          title={isOfflineEmpty ? "You're offline" : 'Could not load characters'}
          description={
            isOfflineEmpty
              ? 'Connect to the internet and try again. Cached characters will appear once you are back online.'
              : error?.message || 'Please check your connection and try again.'
          }
          onRetry={retryCurrentView}
        />
      ) : displayCharacters.length === 0 ? (
        <EmptyState
          title="No characters match your criteria"
          description={
            isSearching
              ? `No superhero or villain found matching "${debouncedQuery}".`
              : `No characters found under the "${selectedFilter}" filter.`
          }
          onReset={handleResetFilters}
        />
      ) : (
        <FlatList
          data={displayCharacters}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + SPACING.xxxl },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isSearching ? isSearchLoading : isRefreshing}
              onRefresh={retryCurrentView}
              tintColor={tokens.text}
              colors={[tokens.buttonPrimaryBg]}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <GridSkeleton count={2} />
              </View>
            ) : undefined
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  controlsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  bannerContainer: {
    paddingHorizontal: SPACING.md,
  },
  contentPadding: {
    padding: SPACING.md,
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
  },
  footerLoader: {
    paddingTop: SPACING.sm,
  },
});
