/**
 * Alignment mapped to product definitions:
 * good -> Hero
 * bad -> Villain
 * neutral / unknown / anything else -> Neutral
 */
export type CharacterAlignment = 'Hero' | 'Villain' | 'Neutral';

export interface Powerstats {
  intelligence: number | null;
  strength: number | null;
  speed: number | null;
  durability: number | null;
  power: number | null;
  combat: number | null;
}

export interface Biography {
  fullName: string;
  alterEgos: string;
  aliases: string[];
  placeOfBirth: string;
  firstAppearance: string;
  publisher: string;
  alignment: CharacterAlignment;
}

export interface Appearance {
  gender: string;
  race: string;
  height: {
    imperial: string;
    metric: string;
  };
  weight: {
    imperial: string;
    metric: string;
  };
  eyeColor: string;
  hairColor: string;
}

export interface Work {
  occupation: string;
  base: string;
}

export interface Connections {
  groupAffiliation: string;
  relatives: string;
}

export interface Character {
  id: number;
  name: string;
  powerstats: Powerstats;
  biography: Biography;
  appearance: Appearance;
  work: Work;
  connections: Connections;
  imageUrl: string | null;
}

/**
 * Raw response structures from SuperHeroAPI
 */
export interface RawPowerstats {
  intelligence?: string | null;
  strength?: string | null;
  speed?: string | null;
  durability?: string | null;
  power?: string | null;
  combat?: string | null;
}

export interface RawBiography {
  'full-name'?: string | null;
  'alter-egos'?: string | null;
  aliases?: string[] | string | null;
  'place-of-birth'?: string | null;
  'first-appearance'?: string | null;
  publisher?: string | null;
  alignment?: string | null;
}

export interface RawAppearance {
  gender?: string | null;
  race?: string | null;
  height?: [string, string] | string[] | null;
  weight?: [string, string] | string[] | null;
  'eye-color'?: string | null;
  'hair-color'?: string | null;
}

export interface RawWork {
  occupation?: string | null;
  base?: string | null;
}

export interface RawConnections {
  'group-affiliation'?: string | null;
  relatives?: string | null;
}

export interface RawImage {
  url?: string | null;
}

export interface RawCharacter {
  response?: string;
  id?: string | number;
  name?: string | null;
  powerstats?: RawPowerstats | null;
  biography?: RawBiography | null;
  appearance?: RawAppearance | null;
  work?: RawWork | null;
  connections?: RawConnections | null;
  image?: RawImage | null;
  error?: string;
}

export interface RawSearchResponse {
  response: 'success' | 'error';
  'results-for'?: string;
  results?: RawCharacter[];
  error?: string;
}
