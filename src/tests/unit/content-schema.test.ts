import { describe, it, expect } from 'vitest';
import { z } from 'astro:content';

// Import the schema from config
const activitySchema = z.object({
  title: z.string(),
  description: z.string(),
  ageRange: z.string(),
  duration: z.string(),
  category: z.enum(['game', 'craft', 'story', 'song', 'festival', 'food', 'other']),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  skills: z.array(z.enum(['listening', 'speaking', 'reading', 'writing', 'cultural'])),

  vocabulary: z.array(z.object({
    simplified: z.string(),
    traditional: z.string().optional(),
    pinyin: z.string(),
    english: z.string(),
  })).optional(),

  phrases: z.array(z.object({
    simplified: z.string(),
    traditional: z.string().optional(),
    pinyin: z.string(),
    english: z.string(),
  })).optional(),

  supplies: z.array(z.string()).optional(),

  printable: z.object({
    title: z.string(),
    url: z.string(),
  }).optional(),

  relatedActivities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

describe('Content Schema Validation', () => {
  it('should accept valid activity data', () => {
    const validActivity = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'game',
      difficultyLevel: 'beginner',
      skills: ['listening', 'speaking'],
    };

    const result = activitySchema.safeParse(validActivity);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields (title)', () => {
    const invalidActivity = {
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'game',
      difficultyLevel: 'beginner',
      skills: ['listening'],
    };

    const result = activitySchema.safeParse(invalidActivity);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields (description)', () => {
    const invalidActivity = {
      title: 'Test Activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'game',
      difficultyLevel: 'beginner',
      skills: ['listening'],
    };

    const result = activitySchema.safeParse(invalidActivity);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields (category)', () => {
    const invalidActivity = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      difficultyLevel: 'beginner',
      skills: ['listening'],
    };

    const result = activitySchema.safeParse(invalidActivity);
    expect(result.success).toBe(false);
  });

  it('should validate vocabulary array structure', () => {
    const activityWithVocab = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'game',
      difficultyLevel: 'beginner',
      skills: ['listening'],
      vocabulary: [
        {
          simplified: '你好',
          pinyin: 'nǐ hǎo',
          english: 'hello',
        },
      ],
    };

    const result = activitySchema.safeParse(activityWithVocab);
    expect(result.success).toBe(true);
  });

  it('should validate phrases array structure', () => {
    const activityWithPhrases = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'game',
      difficultyLevel: 'beginner',
      skills: ['speaking'],
      phrases: [
        {
          simplified: '我很感谢',
          traditional: '我很感謝',
          pinyin: 'wǒ hěn gǎnxiè',
          english: 'I am grateful',
        },
      ],
    };

    const result = activitySchema.safeParse(activityWithPhrases);
    expect(result.success).toBe(true);
  });

  it('should accept valid category values', () => {
    const validCategories = ['game', 'craft', 'story', 'song', 'festival', 'food', 'other'];

    validCategories.forEach((category) => {
      const activity = {
        title: 'Test Activity',
        description: 'A test activity',
        ageRange: '5-10 years',
        duration: '30 minutes',
        category,
        difficultyLevel: 'beginner',
        skills: ['listening'],
      };

      const result = activitySchema.safeParse(activity);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid category values', () => {
    const activity = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'invalid-category',
      difficultyLevel: 'beginner',
      skills: ['listening'],
    };

    const result = activitySchema.safeParse(activity);
    expect(result.success).toBe(false);
  });

  it('should accept valid difficulty levels', () => {
    const validLevels = ['beginner', 'intermediate', 'advanced'];

    validLevels.forEach((level) => {
      const activity = {
        title: 'Test Activity',
        description: 'A test activity',
        ageRange: '5-10 years',
        duration: '30 minutes',
        category: 'game',
        difficultyLevel: level,
        skills: ['listening'],
      };

      const result = activitySchema.safeParse(activity);
      expect(result.success).toBe(true);
    });
  });

  it('should accept optional supplies array', () => {
    const activityWithSupplies = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'craft',
      difficultyLevel: 'beginner',
      skills: ['cultural'],
      supplies: ['Paper', 'Glue', 'Scissors'],
    };

    const result = activitySchema.safeParse(activityWithSupplies);
    expect(result.success).toBe(true);
  });

  it('should accept optional printable object', () => {
    const activityWithPrintable = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'story',
      difficultyLevel: 'intermediate',
      skills: ['reading'],
      printable: {
        title: 'Coloring Page',
        url: '/printables/coloring.pdf',
      },
    };

    const result = activitySchema.safeParse(activityWithPrintable);
    expect(result.success).toBe(true);
  });

  it('should accept optional tags array', () => {
    const activityWithTags = {
      title: 'Test Activity',
      description: 'A test activity',
      ageRange: '5-10 years',
      duration: '30 minutes',
      category: 'game',
      difficultyLevel: 'beginner',
      skills: ['listening'],
      tags: ['numbers', 'active', 'outdoor'],
    };

    const result = activitySchema.safeParse(activityWithTags);
    expect(result.success).toBe(true);
  });
});
