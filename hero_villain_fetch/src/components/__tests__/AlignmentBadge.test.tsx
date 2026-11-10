import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AlignmentBadge } from '../AlignmentBadge';
import { ThemeProvider } from '@/theme/ThemeContext';

describe('AlignmentBadge', () => {
  it('renders Hero alignment badge with correct label and accessibility', async () => {
    await render(
      <ThemeProvider>
        <AlignmentBadge alignment="Hero" />
      </ThemeProvider>
    );

    const badge = screen.getByLabelText('Alignment: Hero');
    expect(badge).toBeTruthy();
    expect(screen.getByText('Hero')).toBeTruthy();
  });

  it('renders Villain alignment badge with outlined style and label', async () => {
    await render(
      <ThemeProvider>
        <AlignmentBadge alignment="Villain" />
      </ThemeProvider>
    );

    const badge = screen.getByLabelText('Alignment: Villain');
    expect(badge).toBeTruthy();
    expect(screen.getByText('Villain')).toBeTruthy();
  });

  it('renders Neutral alignment badge with text label', async () => {
    await render(
      <ThemeProvider>
        <AlignmentBadge alignment="Neutral" />
      </ThemeProvider>
    );

    const badge = screen.getByLabelText('Alignment: Neutral');
    expect(badge).toBeTruthy();
    expect(screen.getByText('Neutral')).toBeTruthy();
  });
});
