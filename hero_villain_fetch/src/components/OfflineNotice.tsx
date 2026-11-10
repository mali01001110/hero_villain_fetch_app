import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, useTheme } from '@/theme/ThemeContext';

interface OfflineNoticeProps {
  message?: string;
  onRetry?: () => void;
}

export function OfflineNotice({
  message = 'Network unavailable. Showing cached characters.',
  onRetry,
}: OfflineNoticeProps) {
  const { tokens } = useTheme();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Feather name="wifi-off" size={16} color={tokens.textSecondary} style={styles.icon} />
      <Text style={[styles.text, { color: tokens.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry network connection"
          style={[styles.retryBtn, { backgroundColor: tokens.buttonPrimaryBg }]}
        >
          <Text style={[styles.retryText, { color: tokens.buttonPrimaryText }]}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load character data. Please check your network and try again.',
  onRetry,
  actionLabel = 'Try Again',
}: ErrorStateProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.errorContainer} accessibilityRole="alert">
      <View style={[styles.errorIconCircle, { borderColor: tokens.border }]}>
        <Feather name="alert-triangle" size={28} color={tokens.text} />
      </View>
      <Text style={[styles.errorTitle, { color: tokens.text }]}>{title}</Text>
      <Text style={[styles.errorDescription, { color: tokens.textSecondary }]}>{description}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={[
            styles.primaryButton,
            { backgroundColor: tokens.buttonPrimaryBg },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: tokens.buttonPrimaryText }]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export function EmptyState({
  title = 'No characters found',
  description = 'Try adjusting your search or active filter.',
  onReset,
}: EmptyStateProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.emptyContainer} accessibilityRole="none">
      <View style={[styles.errorIconCircle, { borderColor: tokens.border }]}>
        <Feather name="search" size={28} color={tokens.textSecondary} />
      </View>
      <Text style={[styles.errorTitle, { color: tokens.text }]}>{title}</Text>
      <Text style={[styles.errorDescription, { color: tokens.textSecondary }]}>{description}</Text>
      {onReset && (
        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Reset filters and search"
          style={[
            styles.primaryButton,
            { backgroundColor: tokens.buttonPrimaryBg },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: tokens.buttonPrimaryText }]}>
            Clear Filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: SPACING.xs,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: 13,
  },
  retryBtn: {
    minHeight: 48,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 4,
    marginLeft: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    minHeight: 48,
    minWidth: 120,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
