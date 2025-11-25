import { describe, it, expect } from 'vitest';
import { combineFilters } from '../../lib/filtering.js';

describe('combineFilters', () => {
  // Sample test data
  const mockActivities = [
    {
      slug: 'counting-game',
      title: 'Number Jump Game',
      description: 'Active counting game for learning numbers',
      category: 'game',
      difficultyLevel: 'beginner',
      ageRange: '3-5 years',
      duration: '15 minutes',
      tags: [],
      hasPrintable: false,
    },
    {
      slug: 'thanksgiving-gratitude',
      title: 'Thanksgiving Gratitude Card',
      description: 'Express gratitude in Mandarin during Thanksgiving',
      category: 'festival',
      difficultyLevel: 'intermediate',
      ageRange: '5-8 years',
      duration: '30 minutes',
      tags: ['thanksgiving', 'cultural'],
      hasPrintable: true,
    },
    {
      slug: 'mid-autumn-story',
      title: 'Mid-Autumn Story Time',
      description: 'Tell the story of Chang\'e and the moon',
      category: 'story',
      difficultyLevel: 'advanced',
      ageRange: '6-10 years',
      duration: '45 minutes',
      tags: ['mid-autumn', 'moon', 'legend'],
      hasPrintable: true,
    },
    {
      slug: 'dragon-craft',
      title: 'Dragon Paper Craft',
      description: 'Make a colorful paper dragon for celebration',
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
      description: 'Learn greetings through a fun song',
      category: 'song',
      difficultyLevel: 'beginner',
      ageRange: '3-6 years',
      duration: '10 minutes',
      tags: ['greetings', 'music'],
      hasPrintable: false,
    },
    {
      slug: 'thanksgiving-craft',
      title: 'Thanksgiving Turkey Craft',
      description: 'Create a turkey using paper and gratitude words',
      category: 'craft',
      difficultyLevel: 'beginner',
      ageRange: '4-7 years',
      duration: '25 minutes',
      tags: ['thanksgiving', 'crafts'],
      hasPrintable: true,
    },
  ];

  it('applies both filters and search together', () => {
    const result = combineFilters(
      mockActivities,
      { category: 'craft', level: 'beginner' },
      'dragon'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('applies filters without search', () => {
    const result = combineFilters(
      mockActivities,
      { category: 'craft' },
      ''
    );

    expect(result).toHaveLength(2);
    expect(result.map(a => a.slug).sort()).toEqual([
      'dragon-craft',
      'thanksgiving-craft',
    ]);
  });

  it('applies search without filters', () => {
    const result = combineFilters(
      mockActivities,
      {},
      'thanksgiving'
    );

    expect(result).toHaveLength(2);
    expect(result.map(a => a.slug).sort()).toEqual([
      'thanksgiving-craft',
      'thanksgiving-gratitude',
    ]);
  });

  it('returns all activities when no filters or search provided', () => {
    const result = combineFilters(mockActivities, {}, '');
    expect(result).toHaveLength(mockActivities.length);
  });

  it('filters work independently of search', () => {
    const result = combineFilters(
      mockActivities,
      { printable: true },
      'story'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('search is applied after filters', () => {
    // First filter by beginner, then search for "craft"
    const result = combineFilters(
      mockActivities,
      { level: 'beginner' },
      'craft'
    );

    expect(result).toHaveLength(2);
    expect(result.every(a => a.difficultyLevel === 'beginner')).toBe(true);
    expect(result.every(a =>
      a.title.toLowerCase().includes('craft') ||
      a.description.toLowerCase().includes('craft')
    )).toBe(true);
  });

  it('handles festival filter with search', () => {
    const result = combineFilters(
      mockActivities,
      { festivals: ['thanksgiving'] },
      'card'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('handles multiple filters with search', () => {
    const result = combineFilters(
      mockActivities,
      {
        category: 'craft',
        level: 'beginner',
        printable: true,
      },
      'thanksgiving'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-craft');
  });

  it('returns empty array when filters eliminate all activities', () => {
    const result = combineFilters(
      mockActivities,
      { category: 'nonexistent' },
      'dragon'
    );

    expect(result).toEqual([]);
  });

  it('returns empty array when search eliminates all filtered activities', () => {
    const result = combineFilters(
      mockActivities,
      { category: 'game' },
      'nonexistent'
    );

    expect(result).toEqual([]);
  });

  it('edge case: empty results handled gracefully', () => {
    const result = combineFilters(
      mockActivities,
      { category: 'game', level: 'advanced' },
      'dragon'
    );

    expect(result).toEqual([]);
  });

  it('handles undefined filters parameter', () => {
    const result = combineFilters(mockActivities, undefined, 'dragon');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('handles undefined search parameter', () => {
    const result = combineFilters(mockActivities, { category: 'craft' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(a => a.category === 'craft')).toBe(true);
  });

  it('handles empty activities array', () => {
    const result = combineFilters([], { category: 'game' }, 'test');
    expect(result).toEqual([]);
  });

  it('does not mutate original activities array', () => {
    const original = [...mockActivities];
    combineFilters(mockActivities, { category: 'game' }, 'dragon');

    expect(mockActivities).toEqual(original);
  });

  it('combines festival filter and search correctly', () => {
    const result = combineFilters(
      mockActivities,
      { festivals: ['thanksgiving', 'mid-autumn'] },
      'story'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('handles case where search returns subset of filtered results', () => {
    const result = combineFilters(
      mockActivities,
      { level: 'beginner' },
      'song'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('song-hello');
    expect(result[0].difficultyLevel).toBe('beginner');
  });

  it('filters by printable and searches for specific term', () => {
    const result = combineFilters(
      mockActivities,
      { printable: true },
      'thanksgiving'
    );

    expect(result).toHaveLength(2);
    expect(result.every(a => a.hasPrintable)).toBe(true);
    expect(result.every(a =>
      a.title.toLowerCase().includes('thanksgiving') ||
      a.description.toLowerCase().includes('thanksgiving')
    )).toBe(true);
  });

  it('applies all filter types with search query', () => {
    const result = combineFilters(
      mockActivities,
      {
        category: 'craft',
        level: 'beginner',
        festivals: ['thanksgiving'],
        printable: true,
      },
      'turkey'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-craft');
  });

  it('handles whitespace-only search with filters', () => {
    const result = combineFilters(
      mockActivities,
      { category: 'craft' },
      '   '
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every(a => a.category === 'craft')).toBe(true);
  });

  it('complex scenario: festival OR logic with category AND search', () => {
    const result = combineFilters(
      mockActivities,
      {
        category: 'craft',
        festivals: ['thanksgiving', 'lunar-new-year'],
      },
      'paper'
    );

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });
});
