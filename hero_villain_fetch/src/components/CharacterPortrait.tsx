import React, { useState } from 'react';
import { DimensionValue, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeContext';

interface CharacterPortraitProps {
  uri: string | null;
  name: string;
  width?: DimensionValue;
  height?: number;
  aspectRatio?: number;
  borderRadius?: number;
}

function getInitials(name: string): string {
  if (!name || name === 'Unknown') {
    return '?';
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function CharacterPortrait({
  uri,
  name,
  width = '100%',
  height,
  aspectRatio,
  borderRadius = 8,
}: CharacterPortraitProps) {
  const { tokens } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);
  const showFallback = !uri || hasError;

  const sizeStyle: ViewStyle = {
    width,
    borderRadius,
    ...(height !== undefined ? { height } : {}),
    ...(aspectRatio !== undefined ? { aspectRatio } : {}),
  };

  return (
    <View
      style={[
        styles.container,
        sizeStyle,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Portrait of ${name}`}
    >
      {!showFallback ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius }]}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={uri}
          transition={isReducedMotionEnabled ? 0 : 200}
          onError={() => setHasError(true)}
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: tokens.surfaceSubtle, borderRadius }]}>
          <Text style={[styles.initials, { color: tokens.text }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
