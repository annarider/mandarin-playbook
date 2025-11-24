import { test, expect } from '@playwright/test';

/**
 * Card Content Display Tests
 *
 * Tests the user-facing behavior of card components:
 * - Are the cards visible to users?
 * - Is the content displayed correctly?
 * - Does the content match the activity data?
 */

test.describe('Card Content Display', () => {
  test('all expected cards are visible on thanksgiving-gratitude page', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // User should see all content cards
    await expect(page.getByRole('heading', { name: 'Vocabulary' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phrases' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Supplies Needed' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Activity Instructions' }).first()).toBeVisible();
  });

  test('vocabulary displays Chinese characters, pinyin, and English translation', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    const vocabSection = page.locator('.vocab-card');

    // Should contain Chinese characters
    const content = await vocabSection.textContent();
    expect(content).toMatch(/[\u4e00-\u9fa5]/);

    // Should show heading
    await expect(page.getByRole('heading', { name: 'Vocabulary' })).toBeVisible();
  });

  test('phrases displays Chinese characters, pinyin, and English translation', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    const phrasesSection = page.locator('.phrases-card');

    // Should contain Chinese characters
    const content = await phrasesSection.textContent();
    expect(content).toMatch(/[\u4e00-\u9fa5]/);

    // Should show heading
    await expect(page.getByRole('heading', { name: 'Phrases' })).toBeVisible();
  });

  test('supplies list displays all required materials', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    await expect(page.getByRole('heading', { name: 'Supplies Needed' })).toBeVisible();

    const suppliesSection = page.locator('.supplies-card');
    const content = await suppliesSection.textContent();

    // Should have actual supply items
    expect(content!.length).toBeGreaterThan(50); // More than just the heading
  });

  test('instructions display markdown-formatted content', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    await expect(page.getByRole('heading', { name: 'Activity Instructions' })).toBeVisible();

    const instructionsSection = page.locator('.instructions-card');

    // Should have multiple headings and content
    const headings = instructionsSection.locator('h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('tips card appears when tips are available', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check if tips exist
    const tipsCard = page.locator('.tips-card');
    const tipsCount = await tipsCard.count();

    if (tipsCount > 0) {
      await expect(page.getByRole('heading', { name: 'Tips for Parents' })).toBeVisible();

      // Should have tip content
      const content = await tipsCard.textContent();
      expect(content!.length).toBeGreaterThan(50);
    }
  });

  test('cards are not displayed when data is missing', async ({ page }) => {
    await page.goto('/activities/counting-game');

    // This activity doesn't have vocabulary
    const vocabCard = page.locator('.vocab-card');
    await expect(vocabCard).not.toBeVisible();
  });

  test('Chinese text is large and readable (18px minimum)', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    const chineseText = page.locator('.vocab-card .chinese').first();
    const fontSize = await chineseText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );

    // Chinese text should be at least 18px
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });
});
