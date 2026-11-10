import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persistOptions, queryClient } from '@/api/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/OfflineNotice';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';

function AppErrorFallback({ onReset }: { onReset: () => void }) {
  const { tokens } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: tokens.background }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ErrorState
        title="Something went wrong"
        description="The app hit an unexpected error. Try again, or restart the app if the problem continues."
        actionLabel="Try again"
        onRetry={onReset}
      />
    </SafeAreaView>
  );
}

function AppNavigation() {
  const { tokens, isDark } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background }}>
      <StatusBar style={tokens.statusBar} />
      {Platform.OS === 'android' && (
        <NavigationBar style={isDark ? 'dark' : 'light'} />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.background },
          animation: isReducedMotionEnabled ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="character/[id]" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ThemeProvider>
        <ErrorBoundary
          fallback={(_error, reset) => <AppErrorFallback onReset={reset} />}
        >
          <AppNavigation />
        </ErrorBoundary>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
