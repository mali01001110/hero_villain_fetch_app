import { DARK_THEME, LIGHT_THEME, SPACING, TYPOGRAPHY } from '../tokens';

describe('Design Tokens', () => {
  it('enforces strictly black and white backgrounds and text', () => {
    expect(LIGHT_THEME.background).toBe('#FFFFFF');
    expect(LIGHT_THEME.text).toBe('#000000');

    expect(DARK_THEME.background).toBe('#000000');
    expect(DARK_THEME.text).toBe('#FFFFFF');
  });

  it('inverts primary button colors correctly', () => {
    // Light mode: black on white
    expect(LIGHT_THEME.buttonPrimaryBg).toBe('#000000');
    expect(LIGHT_THEME.buttonPrimaryText).toBe('#FFFFFF');

    // Dark mode: white on black
    expect(DARK_THEME.buttonPrimaryBg).toBe('#FFFFFF');
    expect(DARK_THEME.buttonPrimaryText).toBe('#000000');
  });

  it('configures monochrome alignment badge tokens', () => {
    // Hero: filled badge
    expect(LIGHT_THEME.badgeHeroBg).toBe('#000000');
    expect(LIGHT_THEME.badgeHeroText).toBe('#FFFFFF');
    expect(DARK_THEME.badgeHeroBg).toBe('#FFFFFF');
    expect(DARK_THEME.badgeHeroText).toBe('#000000');

    // Villain: outlined badge
    expect(LIGHT_THEME.badgeVillainBg).toBe('transparent');
    expect(LIGHT_THEME.badgeVillainBorder).toBe('#000000');
    expect(DARK_THEME.badgeVillainBg).toBe('transparent');
    expect(DARK_THEME.badgeVillainBorder).toBe('#FFFFFF');

    // Neutral: plain text badge
    expect(LIGHT_THEME.badgeNeutralBg).toBe('transparent');
    expect(DARK_THEME.badgeNeutralBg).toBe('transparent');
  });

  it('follows consistent 8dp spacing scale', () => {
    expect(SPACING.xs).toBe(4);
    expect(SPACING.sm).toBe(8);
    expect(SPACING.md).toBe(16);
    expect(SPACING.lg).toBe(24);
    expect(SPACING.xl).toBe(32);
    expect(SPACING.xxl).toBe(40);
    expect(SPACING.xxxl).toBe(48);
    expect(SPACING.huge).toBe(64);
  });

  it('provides complete typography scale', () => {
    expect(TYPOGRAPHY.fontSizes.body).toBe(16);
    expect(TYPOGRAPHY.fontSizes.title).toBe(22);
    expect(TYPOGRAPHY.fontSizes.display).toBe(34);
  });
});
