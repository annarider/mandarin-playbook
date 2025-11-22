import { defineCollection, z } from 'astro:content';

const activities = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ageRange: z.string(),
    duration: z.string(),
    category: z.enum(['game', 'craft', 'story', 'song', 'festival', 'food', 'other']),
    difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    skills: z.array(z.enum(['listening', 'speaking', 'reading', 'writing', 'cultural'])),

    // Optional fields
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
  }),
});

export const collections = {
  activities,
};
