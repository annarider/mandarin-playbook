import { describe, it, expect } from 'vitest';
import { searchActivities } from '../../lib/filtering.js';

describe('searchActivities', () => {
  // Sample test data
  const mockActivities = [
    {
      slug: 'counting-game',
      title: 'Number Jump Game',
      description: 'Active counting game for learning numbers',
      category: 'game',
      difficultyLevel: 'beginner',
      tags: [],
      hasPrintable: false,
    },
    {
      slug: 'thanksgiving-gratitude',
      title: 'Thanksgiving Gratitude',
      description: 'Express gratitude in Mandarin during Thanksgiving',
      category: 'festival',
      difficultyLevel: 'intermediate',
      tags: ['thanksgiving'],
      hasPrintable: true,
    },
    {
      slug: 'mid-autumn-story',
      title: 'Mid-Autumn Story',
      description: 'Tell the story of Chang\'e and the moon',
      category: 'story',
      difficultyLevel: 'advanced',
      tags: ['mid-autumn', 'moon'],
      hasPrintable: true,
    },
    {
      slug: 'dragon-craft',
      title: 'Dragon Craft',
      description: 'Make a colorful paper dragon',
      category: 'craft',
      difficultyLevel: 'beginner',
      tags: ['lunar-new-year'],
      hasPrintable: false,
    },
  ];

  it('finds matches in title (case-insensitive)', () => {
    const result = searchActivities(mockActivities, 'dragon');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('finds matches in title with different case', () => {
    const result = searchActivities(mockActivities, 'DRAGON');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('finds matches in description', () => {
    const result = searchActivities(mockActivities, 'moon');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('finds matches in both title and description', () => {
    const result = searchActivities(mockActivities, 'story');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('returns empty array for no matches', () => {
    const result = searchActivities(mockActivities, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('returns all activities for empty search query', () => {
    const result = searchActivities(mockActivities, '');
    expect(result).toHaveLength(mockActivities.length);
  });

  it('returns all activities for whitespace-only query', () => {
    const result = searchActivities(mockActivities, '   ');
    expect(result).toHaveLength(mockActivities.length);
  });

  it('handles special characters in search', () => {
    const result = searchActivities(mockActivities, 'Chang\'e');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('handles partial matching correctly', () => {
    const result = searchActivities(mockActivities, 'grat');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('partial match works for description', () => {
    const result = searchActivities(mockActivities, 'color');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('ignores leading whitespace', () => {
    const result = searchActivities(mockActivities, '  dragon');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('ignores trailing whitespace', () => {
    const result = searchActivities(mockActivities, 'dragon  ');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('finds multiple matches', () => {
    const result = searchActivities(mockActivities, 'game');
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Game');
  });

  it('searches across multiple activities', () => {
    const result = searchActivities(mockActivities, 'thanksgiving');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('handles undefined query gracefully', () => {
    const result = searchActivities(mockActivities);
    expect(result).toHaveLength(mockActivities.length);
  });

  it('handles null query gracefully', () => {
    const result = searchActivities(mockActivities, null as any);
    expect(result).toHaveLength(mockActivities.length);
  });

  it('does not mutate original activities array', () => {
    const original = [...mockActivities];
    searchActivities(mockActivities, 'dragon');

    expect(mockActivities).toEqual(original);
  });

  it('handles activities with missing title field', () => {
    const activitiesWithMissingTitle = [
      { ...mockActivities[0], title: undefined },
      mockActivities[1],
    ];

    const result = searchActivities(activitiesWithMissingTitle, 'thanksgiving');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('thanksgiving-gratitude');
  });

  it('handles activities with missing description field', () => {
    const activitiesWithMissingDesc = [
      { ...mockActivities[0], description: undefined },
      mockActivities[1],
    ];

    const result = searchActivities(activitiesWithMissingDesc, 'number');
    expect(result).toHaveLength(0);
  });

  it('handles activities with null fields', () => {
    const activitiesWithNulls = [
      { ...mockActivities[0], title: null, description: null },
      mockActivities[1],
    ];

    const result = searchActivities(activitiesWithNulls, 'thanksgiving');
    expect(result).toHaveLength(1);
  });

  it('case-insensitive search works for mixed case query', () => {
    const result = searchActivities(mockActivities, 'DrAgOn');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dragon-craft');
  });

  it('finds matches when query appears in both title and description', () => {
    const result = searchActivities(mockActivities, 'autumn');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });

  it('handles numeric search queries', () => {
    const result = searchActivities(mockActivities, '123');
    expect(result).toEqual([]);
  });

  it('handles search with hyphens', () => {
    const result = searchActivities(mockActivities, 'mid-autumn');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('mid-autumn-story');
  });
});
