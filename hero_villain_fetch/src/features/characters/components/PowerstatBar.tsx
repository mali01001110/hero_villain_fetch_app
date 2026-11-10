import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Powerstats } from '@/api/types';
import { SPACING, useTheme } from '@/theme/ThemeContext';

interface PowerstatBarProps {
  label: string;
  value: number | null;
}

export function PowerstatBar({ label, value }: PowerstatBarProps) {
  const { tokens } = useTheme();

  const isUnknown = value === null || value === undefined;
  const percentage = isUnknown ? 0 : Math.min(100, Math.max(0, value));

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${isUnknown ? 'Unknown' : `${value} out of 100`}`}
      accessibilityValue={{ min: 0, max: 100, now: isUnknown ? undefined : percentage }}
    >
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: tokens.text }]}>{label}</Text>
        <Text style={[styles.value, { color: isUnknown ? tokens.textMuted : tokens.text }]}>
          {isUnknown ? 'Unknown' : `${value}/100`}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: tokens.surfaceSubtle }]}>
        {!isUnknown && (
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                backgroundColor: tokens.buttonPrimaryBg,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

interface PowerstatsSectionProps {
  powerstats: Powerstats;
}

export function PowerstatsSection({ powerstats }: PowerstatsSectionProps) {
  return (
    <View style={styles.section}>
      <PowerstatBar label="Intelligence" value={powerstats.intelligence} />
      <PowerstatBar label="Strength" value={powerstats.strength} />
      <PowerstatBar label="Speed" value={powerstats.speed} />
      <PowerstatBar label="Durability" value={powerstats.durability} />
      <PowerstatBar label="Power" value={powerstats.power} />
      <PowerstatBar label="Combat" value={powerstats.combat} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.sm,
  },
  container: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
