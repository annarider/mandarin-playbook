import { describe, it, expect } from 'vitest';
import { filterActivities } from '../../lib/filtering.js';

describe('filterActivities', () => {
  // Sample test data
  const mockActivities = [
    {
      slug: 'counting-game',
      title: 'Number Jump Game',
      description: 'Active counting game',
      category: 'game',
      difficultyLevel: 'beginner',
      ageRange: '3-5 years',
      duration: '15 minutes',
      tags: [],
      hasPrintable: false,
    },
    {
      slug: 'thanksgiving-gratitude',
      title: 'Thanksgiving Gratitude',
      description: 'Express gratitude in Mandarin',
      category: 'festival',
      difficultyLevel: 'intermediate',
      ageRange: '5-8 years',
      duration: '30 minutes',
      tags: ['thanksgiving', 'cultural'],
      hasPrintable: true,
    },
    {
      slug: 'mid-autumn-story',
      title: 'Mid-Autumn Story',
      description: 'Tell the story of Chang\'e',
      category: 'story',
      difficultyLevel: 'advanced',
      ageRange: '6-10 years',
      duration: '45 minutes',
      tags: ['mid-autumn', 'moon', 'legend'],
      hasPrintable: true,
    },
    {
      slug: 'dragon-craft',
      title: 'Dragon Craft',
      description: 'Make a paper dragon',
      category: 'craft',
      difficultyLevel: 'beginner',
      ageRange: '4-7 years',
      duration: '20 minutes',
      tags: ['lunar-new-year', 'crafts'],
      hasPrintable: false,
    },
    {
      slug: 'song-hello',
      title: 'Hello Song',
      description: 'Learn greetings through song',
      category: 'song',
      difficultyLevel: 'beginner',
      ageRange: '3-6 years',
      duration: '10 minutes',
      tags: ['greetings'],
      hasPrintable: false,
    },
  ];

  it('filters by category correctly', () => {
    const result = filterActivities(mockActivities, { category: 'game' });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('counting-game');
  });

  it('filters by multiple categories', () => {
    const games = filterActivities(mockActivities, { category: 'game' });
    const festivals = filterActivities(mockActivities, { category: 'festival' });

    expect(games).toHaveLength(1);
    expect(festivals).toHaveLength(1);
  });

  it('filters by level correctly', () => {
    const result = filterActivities(mockActivities, { level: 'beginner' });
    expect(result).toHaveLength(3);
    expect(result.every(a => a.difficultyLevel === 'beginner')).toBe(true);
  });

  it('filters by intermediate level', () => {
    const result = filterActivities(mockActivities, { level: 'intermediate' });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('filters by advanced level', () => {
    const result = filterActivities(mockActivities, { level: 'advanced' });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('filters by single festival correctly', () => {
    const result = filterActivities(mockActivities, { festivals: ['thanksgiving'] });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('filters by multiple festivals with OR logic', () => {
    const result = filterActivities(mockActivities, {
      festivals: ['thanksgiving', 'mid-autumn']
    });
    expect(result).toHaveLength(2);
    expect(result.map(a => a.slug).sort()).toEqual([
      'mid-autumn-story',
      'thanksgiving-gratitude',
    ]);
  });

  it('filters by printable status', () => {
    const result = filterActivities(mockActivities, { printable: true });
    expect(result).toHaveLength(2);
    expect(result.every(a => a.hasPrintable === true)).toBe(true);
  });

  it('returns empty array when no matches found', () => {
    const result = filterActivities(mockActivities, { category: 'nonexistent' });
    expect(result).toEqual([]);
  });

  it('returns all activities when no filters applied', () => {
    const result = filterActivities(mockActivities, {});
    expect(result).toHaveLength(mockActivities.length);
  });

  it('returns all activities when filters are empty strings/arrays', () => {
    const result = filterActivities(mockActivities, {
      category: '',
      level: '',
      festivals: [],
      printable: false,
    });
    expect(result).toHaveLength(mockActivities.length);
  });

  it('handles multiple simultaneous filters with AND logic', () => {
    const result = filterActivities(mockActivities, {
      category: 'festival',
      level: 'intermediate',
      printable: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('applies category and level filters together', () => {
    const result = filterActivities(mockActivities, {
      category: 'game',
      level: 'beginner',
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('counting-game');
  });

  it('applies festival and printable filters together', () => {
    const result = filterActivities(mockActivities, {
      festivals: ['mid-autumn'],
      printable: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('handles missing optional fields (tags)', () => {
    const activitiesWithMissingTags = [
      { ...mockActivities[0], tags: undefined },
      { ...mockActivities[1] },
    ];

    const result = filterActivities(activitiesWithMissingTags, {
      festivals: ['thanksgiving'],
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('handles null tags gracefully', () => {
    const activitiesWithNullTags = [
      { ...mockActivities[0], tags: null },
    ];

    const result = filterActivities(activitiesWithNullTags, {
      festivals: ['thanksgiving'],
    });

    expect(result).toEqual([]);
  });

  it('does not mutate original activities array', () => {
    const original = [...mockActivities];
    filterActivities(mockActivities, { category: 'game' });

    expect(mockActivities).toEqual(original);
  });

  it('returns all beginner activities when only level filter is applied', () => {
    const result = filterActivities(mockActivities, { level: 'beginner' });
    expect(result).toHaveLength(3);
    expect(result.map(a => a.slug).sort()).toEqual([
      'counting-game',
      'dragon-craft',
      'song-hello',
    ]);
  });

  it('handles complex multi-filter scenario', () => {
    const result = filterActivities(mockActivities, {
      level: 'beginner',
      festivals: ['lunar-new-year'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('returns empty array when all filters narrow to nothing', () => {
    const result = filterActivities(mockActivities, {
      category: 'game',
      level: 'advanced', // No advanced games in our data
    });
    expect(result).toEqual([]);
  });
});
