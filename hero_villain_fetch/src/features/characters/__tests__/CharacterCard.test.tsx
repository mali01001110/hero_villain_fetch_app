import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { CharacterCard } from '../components/CharacterCard';
import { Character } from '@/api/types';
import { ThemeProvider } from '@/theme/ThemeContext';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('CharacterCard', () => {
  const mockCharacter: Character = {
    id: 70,
    name: 'Batman',
    powerstats: { intelligence: 100, strength: 26, speed: 27, durability: 50, power: 47, combat: 100 },
    biography: {
      fullName: 'Bruce Wayne',
      alterEgos: 'No alter egos found.',
      aliases: ['Insider'],
      placeOfBirth: 'Gotham City',
      firstAppearance: 'Detective Comics #27',
      publisher: 'DC Comics',
      alignment: 'Hero',
    },
    appearance: {
      gender: 'Male',
      race: 'Human',
      height: { imperial: "6'2", metric: '188 cm' },
      weight: { imperial: '210 lb', metric: '95 kg' },
      eyeColor: 'blue',
      hairColor: 'black',
    },
    work: { occupation: 'Businessman', base: 'Batcave, Gotham City' },
    connections: { groupAffiliation: 'Justice League', relatives: 'Thomas Wayne' },
    imageUrl: 'https://example.com/batman.jpg',
  };

  it('renders character name, publisher, and alignment badge', async () => {
    await render(
      <ThemeProvider>
        <CharacterCard character={mockCharacter} />
      </ThemeProvider>
    );

    expect(screen.getByText('Batman')).toBeTruthy();
    expect(screen.getByText('DC Comics')).toBeTruthy();
    expect(screen.getByText('Hero')).toBeTruthy();
  });

  it('navigates to character detail on press', async () => {
    await render(
      <ThemeProvider>
        <CharacterCard character={mockCharacter} />
      </ThemeProvider>
    );

    const cardButton = screen.getByRole('button');
    fireEvent.press(cardButton);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/character/[id]',
      params: { id: '70' },
    });
  });
});
