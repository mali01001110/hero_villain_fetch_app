import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState } from '@/components/OfflineNotice';
import { CharacterDetailScreen } from '@/features/characters/screens/CharacterDetailScreen';
import { MAX_CHARACTER_ID } from '@/features/characters/hooks/useCharacters';
import { useTheme } from '@/theme/ThemeContext';

const ParamsSchema = z.object({
  id: z.coerce.number().int().min(1).max(MAX_CHARACTER_ID),
});

export default function CharacterDetailRoute() {
  const { tokens } = useTheme();
  const rawParams = useLocalSearchParams();
  const parsed = ParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: tokens.background }}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ErrorState
          title="Character not found"
          description={`Character IDs must be whole numbers from 1 to ${MAX_CHARACTER_ID}.`}
          actionLabel="Back to characters"
          onRetry={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  return <CharacterDetailScreen id={String(parsed.data.id)} />;
}
