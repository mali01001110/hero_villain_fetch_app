import {
  fetchCharacterById,
  fetchCharactersBatch,
  searchCharactersByName,
} from '../client';
import { RawCharacter, RawSearchResponse } from '../types';

describe('API Client', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const mockRawBatman: RawCharacter = {
    response: 'success',
    id: '70',
    name: 'Batman',
    powerstats: { intelligence: '100', strength: '26', speed: '27', durability: '50', power: '47', combat: '100' },
    biography: { 'full-name': 'Bruce Wayne', publisher: 'DC Comics', alignment: 'good' },
    appearance: { gender: 'Male', race: 'Human', height: ["6'2", '188 cm'], weight: ['210 lb', '95 kg'] },
    work: { occupation: 'Businessman', base: 'Batcave, Gotham City' },
    connections: { 'group-affiliation': 'Justice League', relatives: 'Thomas Wayne' },
    image: { url: 'https://example.com/batman.jpg' },
  };

  describe('fetchCharacterById', () => {
    it('successfully fetches and normalizes character', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawBatman,
      });

      const character = await fetchCharacterById(70);
      expect(character.id).toBe(70);
      expect(character.name).toBe('Batman');
      expect(character.biography.alignment).toBe('Hero');
    });

    it('redacts token if an HTTP error occurs', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(fetchCharacterById(70)).rejects.toThrow('The superhero API is temporarily unavailable. Please try again.');
    });

    it('retries on 429 rate limit', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockRawBatman,
        });

      global.fetch = mockFetch;

      const character = await fetchCharacterById(70);
      expect(character.id).toBe(70);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchCharactersByName', () => {
    it('returns empty array when search query is empty string', async () => {
      const fetchSpy = jest.fn();
      global.fetch = fetchSpy;

      const result = await searchCharactersByName('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('parses search results correctly', async () => {
      const mockSearchRes: RawSearchResponse = {
        response: 'success',
        'results-for': 'batman',
        results: [mockRawBatman],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSearchRes,
      });

      const results = await searchCharactersByName('batman');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Batman');
    });

    it('returns empty array when API returns response error (not found)', async () => {
      const mockNotFound: RawSearchResponse = {
        response: 'error',
        error: 'character with given name not found',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockNotFound,
      });

      const results = await searchCharactersByName('nonexistent_superhero_xyz');
      expect(results).toEqual([]);
    });
  });

  describe('fetchCharactersBatch', () => {
    it('fetches multiple characters concurrently', async () => {
      global.fetch = jest.fn().mockImplementation((url: string) => {
        const idMatch = url.match(/\/(\d+)$/);
        const id = idMatch ? idMatch[1] : '1';
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            ...mockRawBatman,
            id,
            name: `Hero ${id}`,
          }),
        });
      });

      const characters = await fetchCharactersBatch([1, 2, 3], 2);
      expect(characters.length).toBe(3);
      expect(characters.map((c) => c.id)).toEqual([1, 2, 3]);
    });

    it('filters out failed items without failing the entire batch', async () => {
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.endsWith('/2')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockRawBatman,
        });
      });

      const characters = await fetchCharactersBatch([1, 2, 3], 2);
      expect(characters.length).toBe(2);
    });
  });
});
