import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Character } from '@/api/types';
import { AlignmentBadge } from '@/components/AlignmentBadge';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { SPACING, useTheme } from '@/theme/ThemeContext';

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard = memo(function CharacterCard({ character }: CharacterCardProps) {
  const { tokens } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: '/character/[id]',
      params: { id: String(character.id) },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${character.name}, ${character.biography.alignment}, published by ${character.biography.publisher}`}
      accessibilityHint="Double tap to open full character details"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: tokens.card,
          borderColor: tokens.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <CharacterPortrait
        uri={character.imageUrl}
        name={character.name}
        aspectRatio={0.75}
        borderRadius={0}
      />

      <View style={styles.info}>
        <Text style={[styles.name, { color: tokens.text }]} numberOfLines={1}>
          {character.name}
        </Text>

        <Text style={[styles.publisher, { color: tokens.textSecondary }]} numberOfLines={1}>
          {character.biography.publisher}
        </Text>

        <View style={styles.badgeRow}>
          <AlignmentBadge alignment={character.biography.alignment} size="small" />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 260,
  },
  info: {
    padding: SPACING.sm,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  publisher: {
    fontSize: 12,
  },
  badgeRow: {
    marginTop: 4,
  },
});
