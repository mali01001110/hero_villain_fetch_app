import {
  normalizeAlignment,
  normalizeCharacter,
  normalizeDimension,
  normalizeImageUrl,
  normalizeStat,
  normalizeText,
} from '../normalizer';
import { RawCharacter } from '../types';

describe('normalizer', () => {
  describe('normalizeText', () => {
    it('returns fallback for null, undefined, empty, dash, and null string', () => {
      expect(normalizeText(null)).toBe('Unknown');
      expect(normalizeText(undefined)).toBe('Unknown');
      expect(normalizeText('')).toBe('Unknown');
      expect(normalizeText('   ')).toBe('Unknown');
      expect(normalizeText('-')).toBe('Unknown');
      expect(normalizeText('null')).toBe('Unknown');
      expect(normalizeText('NULL')).toBe('Unknown');
      expect(normalizeText('undefined')).toBe('Unknown');
      expect(normalizeText('none')).toBe('Unknown');
    });

    it('returns trimmed string for valid values', () => {
      expect(normalizeText('  Bruce Wayne  ')).toBe('Bruce Wayne');
      expect(normalizeText('Batman')).toBe('Batman');
    });
  });

  describe('normalizeStat', () => {
    it('returns parsed number from valid integer string', () => {
      expect(normalizeStat('100')).toBe(100);
      expect(normalizeStat('85')).toBe(85);
      expect(normalizeStat('0')).toBe(0);
    });

    it('clamps stat above 100 to 100', () => {
      expect(normalizeStat('150')).toBe(100);
    });

    it('returns null for missing, null, or dash values', () => {
      expect(normalizeStat(null)).toBeNull();
      expect(normalizeStat(undefined)).toBeNull();
      expect(normalizeStat('-')).toBeNull();
      expect(normalizeStat('null')).toBeNull();
      expect(normalizeStat('invalid')).toBeNull();
      expect(normalizeStat('-5')).toBeNull();
    });
  });

  describe('normalizeAlignment', () => {
    it('maps good to Hero', () => {
      expect(normalizeAlignment('good')).toBe('Hero');
      expect(normalizeAlignment('GOOD')).toBe('Hero');
      expect(normalizeAlignment(' Good ')).toBe('Hero');
    });

    it('maps bad to Villain', () => {
      expect(normalizeAlignment('bad')).toBe('Villain');
      expect(normalizeAlignment('BAD')).toBe('Villain');
      expect(normalizeAlignment(' Bad ')).toBe('Villain');
    });

    it('maps neutral, unknown, or dash to Neutral', () => {
      expect(normalizeAlignment('neutral')).toBe('Neutral');
      expect(normalizeAlignment('-')).toBe('Neutral');
      expect(normalizeAlignment('null')).toBe('Neutral');
      expect(normalizeAlignment(null)).toBe('Neutral');
      expect(normalizeAlignment(undefined)).toBe('Neutral');
      expect(normalizeAlignment('other')).toBe('Neutral');
    });
  });

  describe('normalizeDimension', () => {
    it('parses imperial and metric from valid array', () => {
      const dim = normalizeDimension(["6'2", '188 cm']);
      expect(dim.imperial).toBe("6'2");
      expect(dim.metric).toBe('188 cm');
    });

    it('handles dash or null strings in dimension array', () => {
      const dim = normalizeDimension(['-', '0 cm']);
      expect(dim.imperial).toBe('Unknown');
      expect(dim.metric).toBe('Unknown');
    });

    it('handles non-array inputs safely', () => {
      const dim = normalizeDimension(null);
      expect(dim.imperial).toBe('Unknown');
      expect(dim.metric).toBe('Unknown');
    });
  });

  describe('normalizeImageUrl', () => {
    it('accepts valid http/https URLs', () => {
      expect(normalizeImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(normalizeImageUrl('http://example.com/image.png')).toBe('http://example.com/image.png');
    });

    it('returns null for missing, dash, or non-url strings', () => {
      expect(normalizeImageUrl(null)).toBeNull();
      expect(normalizeImageUrl('-')).toBeNull();
      expect(normalizeImageUrl('null')).toBeNull();
      expect(normalizeImageUrl('ftp://invalid')).toBeNull();
    });
  });

  describe('normalizeCharacter', () => {
    const rawValid: RawCharacter = {
      response: 'success',
      id: '70',
      name: 'Batman',
      powerstats: {
        intelligence: '100',
        strength: '26',
        speed: '27',
        durability: '50',
        power: '47',
        combat: '100',
      },
      biography: {
        'full-name': 'Bruce Wayne',
        'alter-egos': 'No alter egos found.',
        aliases: ['Insider', 'Matches Malone'],
        'place-of-birth': 'Crest Hill, Bristol Township; Gotham County',
        'first-appearance': 'Detective Comics #27',
        publisher: 'DC Comics',
        alignment: 'good',
      },
      appearance: {
        gender: 'Male',
        race: 'Human',
        height: ["6'2", '188 cm'],
        weight: ['210 lb', '95 kg'],
        'eye-color': 'blue',
        'hair-color': 'black',
      },
      work: {
        occupation: 'Businessman',
        base: 'Batcave, Gotham City',
      },
      connections: {
        'group-affiliation': 'Justice League, Outsiders, Batman Family',
        relatives: 'Thomas Wayne (father), Martha Wayne (mother)',
      },
      image: {
        url: 'https://www.superherodb.com/pictures2/portraits/10/100/639.jpg',
      },
    };

    it('normalizes a complete character successfully', () => {
      const character = normalizeCharacter(rawValid);
      expect(character.id).toBe(70);
      expect(character.name).toBe('Batman');
      expect(character.powerstats.intelligence).toBe(100);
      expect(character.biography.fullName).toBe('Bruce Wayne');
      expect(character.biography.alignment).toBe('Hero');
      expect(character.biography.aliases).toEqual(['Insider', 'Matches Malone']);
      expect(character.appearance.height.imperial).toBe("6'2");
      expect(character.appearance.height.metric).toBe('188 cm');
      expect(character.work.occupation).toBe('Businessman');
      expect(character.connections.groupAffiliation).toContain('Justice League');
      expect(character.imageUrl).toBe('https://www.superherodb.com/pictures2/portraits/10/100/639.jpg');
    });

    it('handles missing values with "Unknown" or null', () => {
      const rawIncomplete: RawCharacter = {
        response: 'success',
        id: '1',
        name: 'A-Bomb',
        powerstats: {
          intelligence: 'null',
          strength: '-',
          speed: null,
          durability: '',
          power: '38',
          combat: '55',
        },
        biography: {
          'full-name': '',
          'alter-egos': '-',
          aliases: ['-'],
          'place-of-birth': 'null',
          'first-appearance': '-',
          publisher: 'Marvel Comics',
          alignment: 'bad',
        },
        appearance: {
          gender: '-',
          race: 'null',
          height: ['-', '-'],
          weight: ['0 lb', '0 kg'],
          'eye-color': '-',
          'hair-color': '-',
        },
        work: {
          occupation: '-',
          base: '-',
        },
        connections: {
          'group-affiliation': '-',
          relatives: '-',
        },
        image: {
          url: '-',
        },
      };

      const character = normalizeCharacter(rawIncomplete);
      expect(character.id).toBe(1);
      expect(character.powerstats.intelligence).toBeNull();
      expect(character.powerstats.strength).toBeNull();
      expect(character.powerstats.power).toBe(38);
      expect(character.biography.fullName).toBe('Unknown');
      expect(character.biography.alterEgos).toBe('Unknown');
      expect(character.biography.alignment).toBe('Villain');
      expect(character.biography.aliases).toEqual(['Unknown']);
      expect(character.appearance.height.imperial).toBe('Unknown');
      expect(character.appearance.weight.metric).toBe('Unknown');
      expect(character.work.occupation).toBe('Unknown');
      expect(character.connections.relatives).toBe('Unknown');
      expect(character.imageUrl).toBeNull();
    });

    it('throws error when response is error', () => {
      const rawError: RawCharacter = {
        response: 'error',
        error: 'character with given id not found',
      };
      expect(() => normalizeCharacter(rawError)).toThrow('character with given id not found');
    });

    it('throws error on missing or invalid ID', () => {
      const rawBadId: RawCharacter = {
        response: 'success',
        id: 'not-a-number',
      };
      expect(() => normalizeCharacter(rawBadId)).toThrow('Invalid character id');
    });
  });
});
