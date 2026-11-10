import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CharacterPortrait } from '../CharacterPortrait';
import { ThemeProvider } from '@/theme/ThemeContext';

describe('CharacterPortrait', () => {
  it('renders image when uri is provided', async () => {
    await render(
      <ThemeProvider>
        <CharacterPortrait uri="https://example.com/batman.jpg" name="Batman" />
      </ThemeProvider>
    );

    const container = screen.getByLabelText('Portrait of Batman');
    expect(container).toBeTruthy();
  });

  it('renders initials fallback when uri is null', async () => {
    await render(
      <ThemeProvider>
        <CharacterPortrait uri={null} name="Bruce Wayne" />
      </ThemeProvider>
    );

    expect(screen.getByText('BW')).toBeTruthy();
  });

  it('renders single word initials properly', async () => {
    await render(
      <ThemeProvider>
        <CharacterPortrait uri={null} name="Superman" />
      </ThemeProvider>
    );

    expect(screen.getByText('SU')).toBeTruthy();
  });
});
