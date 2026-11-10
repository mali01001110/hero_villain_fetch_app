import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SPACING, useTheme } from '@/theme/ThemeContext';

export type AlignmentFilter = 'All' | 'Hero' | 'Villain' | 'Neutral';

interface FilterChipsProps {
  selectedFilter: AlignmentFilter;
  onSelectFilter: (filter: AlignmentFilter) => void;
}

const FILTERS: { label: string; value: AlignmentFilter }[] = [
  { label: 'All', value: 'All' },
  { label: 'Heroes', value: 'Hero' },
  { label: 'Villains', value: 'Villain' },
  { label: 'Neutral', value: 'Neutral' },
];

export function FilterChips({ selectedFilter, onSelectFilter }: FilterChipsProps) {
  const { tokens } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityRole="tablist"
    >
      {FILTERS.map((item) => {
        const isSelected = selectedFilter === item.value;

        const chipBg = isSelected ? tokens.buttonPrimaryBg : tokens.surface;
        const chipText = isSelected ? tokens.buttonPrimaryText : tokens.textSecondary;
        const chipBorder = isSelected ? tokens.buttonPrimaryBg : tokens.border;

        return (
          <Pressable
            key={item.value}
            onPress={() => onSelectFilter(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Filter by ${item.label}`}
            style={[
              styles.chip,
              {
                backgroundColor: chipBg,
                borderColor: chipBorder,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: chipText }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  chip: {
    minHeight: 48,
    minWidth: 64,
    paddingHorizontal: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
