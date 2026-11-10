import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CharacterAlignment } from '@/api/types';
import { useTheme } from '@/theme/ThemeContext';

interface AlignmentBadgeProps {
  alignment: CharacterAlignment;
  size?: 'small' | 'medium';
}

/**
 * Expresses character alignment strictly without color:
 * - Hero = Filled badge (contrast text)
 * - Villain = Outlined badge (bordered, transparent background)
 * - Neutral = Plain text badge (subtle secondary text, borderless)
 */
export function AlignmentBadge({ alignment, size = 'small' }: AlignmentBadgeProps) {
  const { tokens } = useTheme();

  const isSmall = size === 'small';
  const paddingVertical = isSmall ? 2 : 4;
  const paddingHorizontal = isSmall ? 6 : 10;
  const fontSize = isSmall ? 10 : 12;

  let badgeStyle = {};
  let textStyle = {};

  if (alignment === 'Hero') {
    badgeStyle = {
      backgroundColor: tokens.badgeHeroBg,
      borderWidth: 0,
    };
    textStyle = {
      color: tokens.badgeHeroText,
      fontWeight: '700' as const,
    };
  } else if (alignment === 'Villain') {
    badgeStyle = {
      backgroundColor: tokens.badgeVillainBg,
      borderWidth: 1.5,
      borderColor: tokens.badgeVillainBorder,
    };
    textStyle = {
      color: tokens.badgeVillainText,
      fontWeight: '700' as const,
    };
  } else {
    // Neutral
    badgeStyle = {
      backgroundColor: tokens.badgeNeutralBg,
      borderWidth: 0,
    };
    textStyle = {
      color: tokens.badgeNeutralText,
      fontWeight: '500' as const,
    };
  }

  return (
    <View
      style={[
        styles.badge,
        {
          paddingVertical,
          paddingHorizontal,
        },
        badgeStyle,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Alignment: ${alignment}`}
    >
      <Text style={[styles.text, { fontSize }, textStyle]} numberOfLines={1}>
        {alignment}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
