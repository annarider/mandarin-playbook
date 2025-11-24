import { test, expect } from '@playwright/test';

/**
 * Responsive Card Tests
 *
 * Tests that cards display correctly at different viewport sizes:
 * - Mobile (375px)
 * - Tablet (768px)
 * - Desktop (1920px)
 */

test.describe('Responsive Card Display', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('cards are readable on mobile (375px width)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // All cards should be visible
    await expect(page.getByRole('heading', { name: 'Vocabulary' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phrases' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Supplies Needed' })).toBeVisible();

    // Chinese text should still be readable size
    const chineseText = page.locator('.vocab-card .chinese').first();
    const fontSize = await chineseText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });

  test('cards are readable on tablet (768px width)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(testUrl);

    // All cards should be visible
    await expect(page.getByRole('heading', { name: 'Vocabulary' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phrases' })).toBeVisible();

    // Text should scale up
    const chineseText = page.locator('.vocab-card .chinese').first();
    const fontSize = await chineseText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });

  test('cards are readable on desktop (1920px width)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(testUrl);

    // All cards should be visible
    await expect(page.getByRole('heading', { name: 'Vocabulary' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phrases' })).toBeVisible();

    // Desktop should have maximum container width
    const body = page.locator('body');
    const maxWidth = await body.evaluate((el) =>
      window.getComputedStyle(el).maxWidth
    );
    expect(maxWidth).not.toBe('none');
  });

  test('no horizontal scrolling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Check for horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBe(clientWidth);
  });

  test('cards stack vertically on all viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(testUrl);

      const vocabCard = page.locator('.vocab-card');
      const phrasesCard = page.locator('.phrases-card');

      const vocabBox = await vocabCard.boundingBox();
      const phrasesBox = await phrasesCard.boundingBox();

      // Phrases should be below vocab (higher Y position)
      expect(phrasesBox!.y).toBeGreaterThan(vocabBox!.y);
    }
  });

  test('cards have adequate spacing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    const vocabCard = page.locator('.vocab-card');
    const phrasesCard = page.locator('.phrases-card');

    const vocabBox = await vocabCard.boundingBox();
    const phrasesBox = await phrasesCard.boundingBox();

    // Should have at least 20px gap between cards
    const gap = phrasesBox!.y - (vocabBox!.y + vocabBox!.height);
    expect(gap).toBeGreaterThanOrEqual(10);
  });

  test('text remains readable at all viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(testUrl);

      // Check Chinese text size
      const chineseText = page.locator('.vocab-card .chinese').first();
      const fontSize = await chineseText.evaluate((el) =>
        parseInt(window.getComputedStyle(el).fontSize)
      );

      expect(fontSize, `Chinese text too small on ${viewport.name}`).toBeGreaterThanOrEqual(18);

      // Check English text size
      const englishText = page.locator('.vocab-card .english').first();
      const englishSize = await englishText.evaluate((el) =>
        parseInt(window.getComputedStyle(el).fontSize)
      );

      expect(englishSize, `English text too small on ${viewport.name}`).toBeGreaterThanOrEqual(14);
    }
  });
});
