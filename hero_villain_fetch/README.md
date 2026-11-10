# HERO/VILLAIN FETCH

A strictly monochrome Expo (React Native) mobile app that browses SuperHeroAPI characters (IDs 1–731) by hero / villain / neutral alignment, with search, filters, and full character details.

## Stack

- Expo SDK 58, React Native 0.88, React 19, TypeScript 6
- Expo Router (file-based routing under `src/app/`)
- TanStack Query 5 with AsyncStorage persistence (per-character cache, indefinite TTL)
- `expo-image` (memory-disk cache), `expo-splash-screen`, `expo-system-ui`, `expo-navigation-bar`, `expo-network`
- Jest 30 + `jest-expo` + React Native Testing Library

## Getting started

```bash
# from the hero_villain_fetch/ directory
npm install
npm start            # expo start
npm run android      # expo start --android (dev build required after adding native modules)
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
npm test             # jest
npm run test:coverage
```

### Configuration

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPERHERO_TOKEN` to a valid SuperHeroAPI token:

```
EXPO_PUBLIC_SUPERHERO_TOKEN=your_token_here
```

The token is read only through `src/config/env.ts` and is redacted from errors/logs. It is never committed.

## Design system

Strictly black, white, and neutral greys:
- Light theme: white background, black text.
- Dark theme: black background, white text.
- Alignment is conveyed without accent colors: Hero = filled badge, Villain = outlined badge, Neutral = plain text.
- WCAG AA contrast (4.5:1 normal / 3:1 large), 48 dp minimum touch targets, system font scaling, and reduce-motion support.

## Project structure

```
src/app/              # Expo Router routes (_layout.tsx, index.tsx, character/[id].tsx)
src/api/              # client.ts, normalizer.ts, types.ts, queryClient.ts, errors.ts, config/env.ts
src/components/       # shared UI (SearchBar, FilterChips, CharacterPortrait, ThemeToggle, ...)
src/features/characters/  # screens, hooks, components
src/theme/            # monochrome tokens and ThemeContext
src/hooks/            # useReducedMotion, useAccessibilityAnnouncement
src/test/             # Jest setup
```

## Testing

Tests live next to the code they cover (`**/__tests__/**`). Run:

```bash
npm test             # full suite
npm run test:coverage
```

Coverage target: >= 80%.

## Building

Production binaries are built with EAS (cloud). Because the app fetches from SuperHeroAPI using a token, set `EXPO_PUBLIC_SUPERHERO_TOKEN` as an EAS environment variable for cloud builds — it is not bundled from `.env`.

```bash
npx eas-cli build --platform android --profile production
```

Local Android builds require a development build (`npx expo run:android`) or `eas build --profile development` after adding native modules (`expo-navigation-bar`, `expo-network`).

## Notes

- The SuperHeroAPI base URL returns a `302` to `https://www.superheroapi.com/api.php/...`; the app follows redirects.
- An invalid token returns HTTP 200 with `{"response":"error","error":"access denied"}`; this is surfaced as an authentication/configuration error rather than an empty grid.
- Phase 6 (installable APK) is deferred until explicitly requested.
