import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, useTheme } from '@/theme/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search superheroes and villains...',
}: SearchBarProps) {
  const { tokens } = useTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
    >
      <Feather name="search" size={18} color={tokens.textMuted} style={styles.searchIcon} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.textMuted}
        style={[styles.input, { color: tokens.text }]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel="Search heroes and villains"
      />

      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearButton}
        >
          <Feather name="x" size={18} color={tokens.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    minHeight: 46,
    fontSize: 16,
    paddingVertical: SPACING.sm,
  },
  clearButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
