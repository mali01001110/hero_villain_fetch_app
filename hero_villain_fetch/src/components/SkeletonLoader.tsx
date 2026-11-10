import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SPACING, useTheme } from '@/theme/ThemeContext';

export function CardSkeleton() {
  const { tokens } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tokens.card,
          borderColor: tokens.border,
        },
      ]}
      accessibilityRole="none"
      accessibilityLabel="Loading character card"
    >
      <View style={[styles.portrait, { backgroundColor: tokens.surfaceSubtle }]} />
      <View style={styles.cardInfo}>
        <View style={[styles.nameLine, { backgroundColor: tokens.surfaceSubtle }]} />
        <View style={[styles.publisherLine, { backgroundColor: tokens.surfaceSubtle }]} />
        <View style={[styles.badgeLine, { backgroundColor: tokens.surfaceSubtle }]} />
      </View>
    </View>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.grid}>
      {items.map((i) => (
        <View key={i} style={styles.gridItem}>
          <CardSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  gridItem: {
    width: '50%',
    padding: SPACING.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  portrait: {
    width: '100%',
    aspectRatio: 0.75,
  },
  cardInfo: {
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  nameLine: {
    height: 16,
    width: '80%',
    borderRadius: 4,
  },
  publisherLine: {
    height: 12,
    width: '50%',
    borderRadius: 4,
  },
  badgeLine: {
    height: 18,
    width: 60,
    borderRadius: 4,
    marginTop: 4,
  },
});
