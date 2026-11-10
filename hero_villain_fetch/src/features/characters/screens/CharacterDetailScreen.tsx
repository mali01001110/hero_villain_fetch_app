import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AlignmentBadge } from '@/components/AlignmentBadge';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { ErrorState } from '@/components/OfflineNotice';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  AppearanceSection,
  BiographySection,
  ConnectionsSection,
  SectionContainer,
  WorkSection,
} from '@/features/characters/components/DetailSection';
import { PowerstatsSection } from '@/features/characters/components/PowerstatBar';
import { useCharacter } from '@/features/characters/hooks/useCharacters';
import { SPACING, useTheme } from '@/theme/ThemeContext';

interface CharacterDetailScreenProps {
  id: string;
}

export function CharacterDetailScreen({ id }: CharacterDetailScreenProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: character, isLoading, error, refetch } = useCharacter(id);
  const portraitHeight = Math.min(420, Math.max(240, (width - SPACING.md * 2) * 1.05));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: tokens.border }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to character list"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: pressed ? tokens.surfaceSubtle : 'transparent',
              borderColor: tokens.border,
            },
          ]}
        >
          <Feather name="arrow-left" size={20} color={tokens.text} />
        </Pressable>

        <Text
          style={[styles.headerTitle, { color: tokens.text }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {character ? character.name : `Character #${id}`}
        </Text>

        <ThemeToggle />
      </View>

      {/* Screen Body */}
      {isLoading ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + SPACING.huge },
          ]}
        >
          <View
            style={[
              styles.skeletonPortrait,
              { height: portraitHeight, backgroundColor: tokens.surfaceSubtle },
            ]}
          />
          <View style={[styles.skeletonHeader, { backgroundColor: tokens.surfaceSubtle }]} />
          <View style={[styles.skeletonSection, { backgroundColor: tokens.surfaceSubtle }]} />
          <View style={[styles.skeletonSection, { backgroundColor: tokens.surfaceSubtle }]} />
        </ScrollView>
      ) : error || !character ? (
        <ErrorState
          title="Could not load character"
          description={error?.message || `Failed to fetch character #${id}.`}
          onRetry={refetch}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + SPACING.huge },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Portrait */}
          <CharacterPortrait
            uri={character.imageUrl}
            name={character.name}
            height={portraitHeight}
            borderRadius={12}
          />

          {/* Title & Real Name & Alignment Badge */}
          <View style={styles.titleSection}>
            <View style={styles.nameHeaderRow}>
              <View style={styles.nameContainer}>
                <Text style={[styles.characterName, { color: tokens.text }]}>
                  {character.name}
                </Text>
                <Text style={[styles.realName, { color: tokens.textSecondary }]}>
                  {character.biography.fullName !== 'Unknown'
                    ? character.biography.fullName
                    : character.biography.alterEgos !== 'Unknown'
                    ? character.biography.alterEgos
                    : 'Real Name Unknown'}
                </Text>
              </View>
              <AlignmentBadge alignment={character.biography.alignment} size="medium" />
            </View>
          </View>

          {/* Section: Powerstats */}
          <SectionContainer title="Powerstats">
            <PowerstatsSection powerstats={character.powerstats} />
          </SectionContainer>

          {/* Section: Biography */}
          <BiographySection biography={character.biography} />

          {/* Section: Appearance */}
          <AppearanceSection appearance={character.appearance} />

          {/* Section: Work */}
          <WorkSection work={character.work} />

          {/* Section: Connections */}
          <ConnectionsSection connections={character.connections} />
        </ScrollView>
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
  backButton: {
    minWidth: 48,
    minHeight: 48,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: SPACING.sm,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  titleSection: {
    marginVertical: SPACING.md,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  nameContainer: {
    flex: 1,
  },
  characterName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  realName: {
    fontSize: 16,
    marginTop: 2,
    fontWeight: '500',
  },
  skeletonPortrait: {
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  skeletonHeader: {
    height: 60,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  skeletonSection: {
    height: 140,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
});
