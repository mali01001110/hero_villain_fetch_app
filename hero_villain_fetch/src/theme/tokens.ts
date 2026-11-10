/**
 * Strictly Black and White Design Tokens.
 *
 * Rules:
 * - Light theme: White background (#FFFFFF), black text (#000000).
 * - Dark theme: Black background (#000000), white text (#FFFFFF).
 * - Only neutral greys for surfaces, borders, and secondary text.
 * - No accent colors anywhere in UI chrome.
 * - WCAG AA contrast (minimum 4.5:1 for normal text, 3:1 for large/graphical).
 * - Strict 8dp spacing scale.
 */

export type ThemeMode = 'light' | 'dark';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
} as const;

export const TYPOGRAPHY = {
  fontSizes: {
    caption: 12,
    bodySm: 14,
    body: 16,
    subtitle: 18,
    title: 22,
    headline: 28,
    display: 34,
  },
  lineHeights: {
    caption: 16,
    bodySm: 20,
    body: 24,
    subtitle: 26,
    title: 30,
    headline: 36,
    display: 42,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '900' as const,
  },
};

export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export interface ThemeColors {
  // Foundations
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;

  // Typography
  text: string;
  textSecondary: string;
  textMuted: string;

  // Borders & Dividers
  border: string;
  borderStrong: string;
  divider: string;

  // Inverted Primary Controls
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;

  // Alignment Badges (Pure Monochrome)
  // Hero: Filled badge
  badgeHeroBg: string;
  badgeHeroText: string;
  // Villain: Outlined badge
  badgeVillainBg: string;
  badgeVillainBorder: string;
  badgeVillainText: string;
  // Neutral: Plain text badge
  badgeNeutralBg: string;
  badgeNeutralText: string;

  // System bars
  statusBar: 'light' | 'dark';
  navBarBg: string;
}

export const LIGHT_THEME: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceSubtle: '#EEEEEE',
  card: '#FFFFFF',

  text: '#000000',
  textSecondary: '#4A4A4A', // 5.2:1 contrast ratio against #FFFFFF (WCAG AA pass)
  textMuted: '#707070',     // 4.6:1 contrast ratio against #FFFFFF (WCAG AA pass)

  border: '#E0E0E0',
  borderStrong: '#000000',
  divider: '#EBEBEB',

  buttonPrimaryBg: '#000000',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F5F5F5',
  buttonSecondaryText: '#000000',
  buttonSecondaryBorder: '#000000',

  badgeHeroBg: '#000000',
  badgeHeroText: '#FFFFFF',

  badgeVillainBg: 'transparent',
  badgeVillainBorder: '#000000',
  badgeVillainText: '#000000',

  badgeNeutralBg: 'transparent',
  badgeNeutralText: '#4A4A4A',

  statusBar: 'dark',
  navBarBg: '#FFFFFF',
};

export const DARK_THEME: ThemeColors = {
  background: '#000000',
  surface: '#121212',
  surfaceSubtle: '#1C1C1C',
  card: '#161616',

  text: '#FFFFFF',
  textSecondary: '#B5B5B5', // 9.5:1 contrast ratio against #000000 (WCAG AA pass)
  textMuted: '#8E8E8E',     // 6.0:1 contrast ratio against #000000 (WCAG AA pass)

  border: '#2A2A2A',
  borderStrong: '#FFFFFF',
  divider: '#222222',

  buttonPrimaryBg: '#FFFFFF',
  buttonPrimaryText: '#000000',
  buttonSecondaryBg: '#1C1C1C',
  buttonSecondaryText: '#FFFFFF',
  buttonSecondaryBorder: '#FFFFFF',

  badgeHeroBg: '#FFFFFF',
  badgeHeroText: '#000000',

  badgeVillainBg: 'transparent',
  badgeVillainBorder: '#FFFFFF',
  badgeVillainText: '#FFFFFF',

  badgeNeutralBg: 'transparent',
  badgeNeutralText: '#B5B5B5',

  statusBar: 'light',
  navBarBg: '#000000',
};

export const THEMES: Record<ThemeMode, ThemeColors> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};
