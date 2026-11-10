import React from 'react';
import { render, screen } from '@testing-library/react-native';
import {
  AppearanceSection,
  BiographySection,
  ConnectionsSection,
  WorkSection,
} from '../components/DetailSection';
import { Appearance, Biography, Connections, Work } from '@/api/types';
import { ThemeProvider } from '@/theme/ThemeContext';

describe('DetailSection components', () => {
  it('renders Biography section with all required fields', async () => {
    const bio: Biography = {
      fullName: 'Bruce Wayne',
      alterEgos: 'No alter egos found.',
      aliases: ['Insider', 'Matches Malone'],
      placeOfBirth: 'Gotham City',
      firstAppearance: 'Detective Comics #27',
      publisher: 'DC Comics',
      alignment: 'Hero',
    };

    await render(
      <ThemeProvider>
        <BiographySection biography={bio} />
      </ThemeProvider>
    );

    expect(screen.getByText('Biography')).toBeTruthy();
    expect(screen.getByText('Bruce Wayne')).toBeTruthy();
    expect(screen.getByText('Insider, Matches Malone')).toBeTruthy();
    expect(screen.getByText('Gotham City')).toBeTruthy();
    expect(screen.getByText('Detective Comics #27')).toBeTruthy();
    expect(screen.getByText('DC Comics')).toBeTruthy();
  });

  it('renders Appearance section with gender, race, dimensions, eye/hair color', async () => {
    const app: Appearance = {
      gender: 'Male',
      race: 'Human',
      height: { imperial: "6'2", metric: '188 cm' },
      weight: { imperial: '210 lb', metric: '95 kg' },
      eyeColor: 'blue',
      hairColor: 'black',
    };

    await render(
      <ThemeProvider>
        <AppearanceSection appearance={app} />
      </ThemeProvider>
    );

    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Human')).toBeTruthy();
    expect(screen.getByText("6'2 (188 cm)")).toBeTruthy();
    expect(screen.getByText('210 lb (95 kg)')).toBeTruthy();
    expect(screen.getByText('blue')).toBeTruthy();
    expect(screen.getByText('black')).toBeTruthy();
  });

  it('renders Work section with occupation and base', async () => {
    const work: Work = {
      occupation: 'Businessman',
      base: 'Batcave, Gotham City',
    };

    await render(
      <ThemeProvider>
        <WorkSection work={work} />
      </ThemeProvider>
    );

    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Businessman')).toBeTruthy();
    expect(screen.getByText('Batcave, Gotham City')).toBeTruthy();
  });

  it('renders Connections section with group affiliation and relatives', async () => {
    const conn: Connections = {
      groupAffiliation: 'Justice League',
      relatives: 'Thomas Wayne, Martha Wayne',
    };

    await render(
      <ThemeProvider>
        <ConnectionsSection connections={conn} />
      </ThemeProvider>
    );

    expect(screen.getByText('Connections')).toBeTruthy();
    expect(screen.getByText('Justice League')).toBeTruthy();
    expect(screen.getByText('Thomas Wayne, Martha Wayne')).toBeTruthy();
  });
});
