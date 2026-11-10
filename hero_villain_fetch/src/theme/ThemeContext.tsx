import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {
  DARK_THEME,
  LIGHT_THEME,
  SPACING,
  THEMES,
  TYPOGRAPHY,
  ThemeColors,
  ThemeMode,
} from './tokens';

const THEME_STORAGE_KEY = '@hero_villain_theme_preference';

try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Splash screen may already be hidden, or unavailable in tests.
  });
} catch {
  // Ignore if the native splash module is unavailable.
}

interface ThemeContextValue {
  themeMode: ThemeMode;
  tokens: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isThemeReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const initialSchemeRef = useRef(systemScheme);

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() =>
    systemScheme === 'dark' ? 'dark' : 'light',
  );
  const [isThemeReady, setIsThemeReady] = useState(false);

  const applySystemUI = useCallback((mode: ThemeMode) => {
    const background = mode === 'dark' ? DARK_THEME.background : LIGHT_THEME.background;
    try {
      SystemUI.setBackgroundColorAsync(background).catch(() => {
        // Silently ignore if SystemUI is unavailable in mock/test.
      });
    } catch {
      // Ignore.
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!isMounted) {
          return;
        }

        const nextMode: ThemeMode =
          saved === 'light' || saved === 'dark'
            ? saved
            : initialSchemeRef.current === 'dark'
              ? 'dark'
              : 'light';

        setThemeModeState(nextMode);
        applySystemUI(nextMode);
      } catch {
        // Fall back to the system-derived initial theme.
      } finally {
        if (isMounted) {
          setIsThemeReady(true);
          try {
            SplashScreen.hideAsync().catch(() => {});
          } catch {
            // Ignore if splash screen cannot hide.
          }
        }
      }
    }

    void loadSavedTheme();

    return () => {
      isMounted = false;
    };
  }, [applySystemUI]);

  const setThemeMode = useCallback(
    (newMode: ThemeMode) => {
      setThemeModeState(newMode);
      applySystemUI(newMode);
      AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
    },
    [applySystemUI]
  );

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, setThemeMode]);

  const tokens = THEMES[themeMode];
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        tokens,
        isDark,
        toggleTheme,
        setThemeMode,
        isThemeReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to consume current theme mode, tokens, and toggle function.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { SPACING, TYPOGRAPHY };
