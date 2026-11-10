import {
  Character,
  CharacterAlignment,
  Powerstats,
  RawCharacter,
} from './types';

/**
 * Normalizes any text field from SuperHeroAPI.
 * Handles quirks like "null", "-", empty strings, and null/undefined values.
 */
export function normalizeText(value: unknown, fallback = 'Unknown'): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  const str = String(value).trim();
  if (
    str === '' ||
    str === '-' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'undefined' ||
    str.toLowerCase() === 'none' ||
    /^no [a-z0-9\s-]+ found\.?$/i.test(str)
  ) {
    return fallback;
  }
  return str;
}

/**
 * Normalizes powerstats values.
 * In SuperHeroAPI numbers arrive as strings or "-" or "null".
 */
export function normalizeStat(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const str = String(value).trim();
  if (str === '' || str === '-' || str.toLowerCase() === 'null') {
    return null;
  }
  const parsed = parseInt(str, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }
  return Math.min(100, parsed);
}

/**
 * Maps SuperHeroAPI alignment string to product definitions:
 * - good -> Hero
 * - bad -> Villain
 * - neutral / unknown / other -> Neutral
 */
export function normalizeAlignment(value: unknown): CharacterAlignment {
  if (typeof value !== 'string') {
    return 'Neutral';
  }
  const lower = value.trim().toLowerCase();
  if (lower === 'good') {
    return 'Hero';
  }
  if (lower === 'bad') {
    return 'Villain';
  }
  return 'Neutral';
}

/**
 * Normalizes aliases array.
 */
export function normalizeAliases(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === 'string') {
      const normalized = normalizeText(value, '');
      return normalized ? [normalized] : ['Unknown'];
    }
    return ['Unknown'];
  }

  const validAliases = value
    .map((item) => normalizeText(item, ''))
    .filter((item) => item.length > 0);

  return validAliases.length > 0 ? validAliases : ['Unknown'];
}

/**
 * Normalizes height and weight measurements: [imperial, metric] array.
 */
export function normalizeDimension(value: unknown): { imperial: string; metric: string } {
  if (!Array.isArray(value)) {
    return { imperial: 'Unknown', metric: 'Unknown' };
  }

  const rawImperial = value[0] !== undefined ? String(value[0]).trim() : '';
  const rawMetric = value[1] !== undefined ? String(value[1]).trim() : '';

  const imperial =
    !rawImperial || rawImperial === '-' || rawImperial.toLowerCase() === 'null' || rawImperial === '0 lb'
      ? 'Unknown'
      : rawImperial;

  const metric =
    !rawMetric || rawMetric === '-' || rawMetric.toLowerCase() === 'null' || rawMetric === '0 cm' || rawMetric === '0 kg'
      ? 'Unknown'
      : rawMetric;

  return { imperial, metric };
}

/**
 * Normalizes image URL, handling missing, null or placeholder URLs.
 */
export function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null') {
    return null;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return null;
}

/**
 * ONE primary normalizer function for SuperHeroAPI characters.
 * Handles all known API quirks and produces a safe, strongly-typed Character object.
 */
export function normalizeCharacter(raw: RawCharacter): Character {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid character data: payload is null or not an object');
  }

  if (raw.response === 'error') {
    throw new Error(raw.error || 'SuperHeroAPI returned an error response');
  }

  const rawId = raw.id;
  const id = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error(`Invalid character id: ${String(rawId)}`);
  }

  const powerstats: Powerstats = {
    intelligence: normalizeStat(raw.powerstats?.intelligence),
    strength: normalizeStat(raw.powerstats?.strength),
    speed: normalizeStat(raw.powerstats?.speed),
    durability: normalizeStat(raw.powerstats?.durability),
    power: normalizeStat(raw.powerstats?.power),
    combat: normalizeStat(raw.powerstats?.combat),
  };

  const bio = raw.biography;
  const biography = {
    fullName: normalizeText(bio?.['full-name']),
    alterEgos: normalizeText(bio?.['alter-egos']),
    aliases: normalizeAliases(bio?.aliases),
    placeOfBirth: normalizeText(bio?.['place-of-birth']),
    firstAppearance: normalizeText(bio?.['first-appearance']),
    publisher: normalizeText(bio?.publisher),
    alignment: normalizeAlignment(bio?.alignment),
  };

  const app = raw.appearance;
  const appearance = {
    gender: normalizeText(app?.gender),
    race: normalizeText(app?.race),
    height: normalizeDimension(app?.height),
    weight: normalizeDimension(app?.weight),
    eyeColor: normalizeText(app?.['eye-color']),
    hairColor: normalizeText(app?.['hair-color']),
  };

  const work = {
    occupation: normalizeText(raw.work?.occupation),
    base: normalizeText(raw.work?.base),
  };

  const conn = raw.connections;
  const connections = {
    groupAffiliation: normalizeText(conn?.['group-affiliation']),
    relatives: normalizeText(conn?.relatives),
  };

  return {
    id,
    name: normalizeText(raw.name, 'Unnamed Character'),
    powerstats,
    biography,
    appearance,
    work,
    connections,
    imageUrl: normalizeImageUrl(raw.image?.url),
  };
}
