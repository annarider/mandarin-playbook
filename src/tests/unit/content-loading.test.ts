import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const activitiesDir = path.join(process.cwd(), 'src/content/activities');

function getAllActivities() {
  const files = fs.readdirSync(activitiesDir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(activitiesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      return {
        slug: file.replace('.md', ''),
        data,
        body: content,
      };
    });
}

describe('Content Loading', () => {
  it('should have all 3 sample activity files', () => {
    const activities = getAllActivities();
    expect(activities.length).toBe(3);
  });

  it('should have correct activity file structure', () => {
    const activities = getAllActivities();

    activities.forEach((activity) => {
      expect(activity).toHaveProperty('slug');
      expect(activity).toHaveProperty('data');
      expect(activity).toHaveProperty('body');
    });
  });

  it('should have properly structured frontmatter data', () => {
    const activities = getAllActivities();

    activities.forEach((activity) => {
      expect(activity.data).toHaveProperty('title');
      expect(activity.data).toHaveProperty('description');
      expect(activity.data).toHaveProperty('ageRange');
      expect(activity.data).toHaveProperty('duration');
      expect(activity.data).toHaveProperty('category');
      expect(activity.data).toHaveProperty('difficultyLevel');
      expect(activity.data).toHaveProperty('skills');

      expect(typeof activity.data.title).toBe('string');
      expect(typeof activity.data.description).toBe('string');
      expect(Array.isArray(activity.data.skills)).toBe(true);
    });
  });

  it('should have accessible markdown body content', () => {
    const activities = getAllActivities();

    activities.forEach((activity) => {
      expect(typeof activity.body).toBe('string');
      expect(activity.body.length).toBeGreaterThan(0);
    });
  });

  it('should load thanksgiving-gratitude activity with vocab and phrases', () => {
    const activities = getAllActivities();
    const thanksgiving = activities.find(a => a.slug === 'thanksgiving-gratitude');

    expect(thanksgiving).toBeDefined();
    expect(thanksgiving?.data.title).toBe('Thanksgiving Gratitude Circle');
    expect(thanksgiving?.data.category).toBe('festival');
    expect(thanksgiving?.data.vocabulary).toBeDefined();
    expect(thanksgiving?.data.phrases).toBeDefined();
    expect(thanksgiving?.data.supplies).toBeDefined();

    // Check vocabulary structure
    expect(Array.isArray(thanksgiving?.data.vocabulary)).toBe(true);
    expect(thanksgiving?.data.vocabulary?.length).toBeGreaterThan(0);

    if (thanksgiving?.data.vocabulary) {
      const firstVocab = thanksgiving.data.vocabulary[0];
      expect(firstVocab).toHaveProperty('simplified');
      expect(firstVocab).toHaveProperty('pinyin');
      expect(firstVocab).toHaveProperty('english');
    }

    // Check phrases structure
    expect(Array.isArray(thanksgiving?.data.phrases)).toBe(true);
    expect(thanksgiving?.data.phrases?.length).toBeGreaterThan(0);
  });

  it('should load counting-game activity with minimal fields', () => {
    const activities = getAllActivities();
    const counting = activities.find(a => a.slug === 'counting-game');

    expect(counting).toBeDefined();
    expect(counting?.data.title).toBe('Number Jump Game');
    expect(counting?.data.category).toBe('game');
    expect(counting?.data.difficultyLevel).toBe('beginner');

    // This activity has minimal optional fields
    expect(counting?.data.vocabulary).toBeUndefined();
    expect(counting?.data.phrases).toBeUndefined();
  });

  it('should load mid-autumn-story activity with printable', () => {
    const activities = getAllActivities();
    const midAutumn = activities.find(a => a.slug === 'mid-autumn-story');

    expect(midAutumn).toBeDefined();
    expect(midAutumn?.data.title).toBe('Mid-Autumn Festival Story Time');
    expect(midAutumn?.data.category).toBe('festival');
    expect(midAutumn?.data.printable).toBeDefined();
    expect(midAutumn?.data.printable?.title).toBe('Chang\'e Coloring Page');
    expect(midAutumn?.data.printable?.url).toBe('/printables/change-coloring.pdf');
  });

  it('should filter activities by category', () => {
    const allActivities = getAllActivities();
    const festivalActivities = allActivities.filter(a => a.data.category === 'festival');

    expect(festivalActivities.length).toBe(2); // thanksgiving-gratitude and mid-autumn-story

    festivalActivities.forEach((activity) => {
      expect(activity.data.category).toBe('festival');
    });
  });

  it('should filter activities by difficulty level', () => {
    const allActivities = getAllActivities();
    const beginnerActivities = allActivities.filter(a => a.data.difficultyLevel === 'beginner');

    expect(beginnerActivities.length).toBeGreaterThan(0);

    beginnerActivities.forEach((activity) => {
      expect(activity.data.difficultyLevel).toBe('beginner');
    });
  });

  it('should filter activities by skills', () => {
    const allActivities = getAllActivities();
    const listeningActivities = allActivities.filter(
      a => a.data.skills.includes('listening')
    );

    expect(listeningActivities.length).toBeGreaterThan(0);

    listeningActivities.forEach((activity) => {
      expect(activity.data.skills).toContain('listening');
    });
  });

  it('should have unique slugs for all activities', () => {
    const activities = getAllActivities();
    const slugs = activities.map(a => a.slug);
    const uniqueSlugs = new Set(slugs);

    expect(slugs.length).toBe(uniqueSlugs.size);
  });
});
