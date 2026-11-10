import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 22 }: ThemeToggleProps) {
  const { isDark, toggleTheme, tokens } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      accessibilityHint="Toggles between light and dark monochrome themes"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: tokens.border,
          backgroundColor: pressed ? tokens.surfaceSubtle : 'transparent',
        },
      ]}
    >
      <Feather
        name={isDark ? 'sun' : 'moon'}
        size={size}
        color={tokens.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 48,
    minHeight: 48,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
