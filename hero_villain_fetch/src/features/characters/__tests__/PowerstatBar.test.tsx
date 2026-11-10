import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PowerstatBar, PowerstatsSection } from '../components/PowerstatBar';
import { ThemeProvider } from '@/theme/ThemeContext';

describe('PowerstatBar & PowerstatsSection', () => {
  it('renders numeric stat and bar', async () => {
    await render(
      <ThemeProvider>
        <PowerstatBar label="Strength" value={85} />
      </ThemeProvider>
    );

    expect(screen.getByText('Strength')).toBeTruthy();
    expect(screen.getByText('85/100')).toBeTruthy();
  });

  it('renders "Unknown" when value is null', async () => {
    await render(
      <ThemeProvider>
        <PowerstatBar label="Speed" value={null} />
      </ThemeProvider>
    );

    expect(screen.getByText('Speed')).toBeTruthy();
    expect(screen.getByText('Unknown')).toBeTruthy();
  });

  it('renders all six powerstats in section', async () => {
    const stats = {
      intelligence: 100,
      strength: 90,
      speed: 80,
      durability: 70,
      power: 60,
      combat: 50,
    };

    await render(
      <ThemeProvider>
        <PowerstatsSection powerstats={stats} />
      </ThemeProvider>
    );

    expect(screen.getByText('Intelligence')).toBeTruthy();
    expect(screen.getByText('Strength')).toBeTruthy();
    expect(screen.getByText('Speed')).toBeTruthy();
    expect(screen.getByText('Durability')).toBeTruthy();
    expect(screen.getByText('Power')).toBeTruthy();
    expect(screen.getByText('Combat')).toBeTruthy();
  });
});
