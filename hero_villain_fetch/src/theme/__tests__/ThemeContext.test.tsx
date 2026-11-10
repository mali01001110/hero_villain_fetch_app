import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

function TestConsumer() {
  const { themeMode } = useTheme();
  return (
    <>
      <Text testID="theme-mode">{themeMode}</Text>
      <ThemeToggle />
    </>
  );
}

describe('ThemeContext and ThemeToggle', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('renders with initial theme and provides toggle functionality', async () => {
    await render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    const modeText = screen.getByTestId('theme-mode');
    expect(modeText.props.children).toBeDefined();

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeTruthy();

    const initialMode = modeText.props.children;
    await act(async () => {
      fireEvent.press(toggleButton);
    });

    await waitFor(() => {
      const updatedMode = screen.getByTestId('theme-mode').props.children;
      expect(updatedMode).not.toBe(initialMode);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@hero_villain_theme_preference',
      expect.stringMatching(/light|dark/)
    );
  });

  it('loads saved theme preference from AsyncStorage on mount', async () => {
    await AsyncStorage.setItem('@hero_villain_theme_preference', 'dark');

    await render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      const modeText = screen.getByTestId('theme-mode');
      expect(modeText.props.children).toBe('dark');
    });
  });

  it('has accessible label on ThemeToggle', async () => {
    await render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toMatch(/Switch to (light|dark) theme/);
    expect(button.props.accessibilityHint).toContain('monochrome');
  });
});
