import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * Uses Playwright screenshots to catch visual changes in card components.
 * Run `npm run test:integration -- --update-snapshots` to update baselines.
 */

test.describe('Visual Regression - Card Components', () => {
  test('VocabCard visual appearance (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    const vocabCard = page.locator('.vocab-card');
    await expect(vocabCard).toBeVisible();

    await expect(vocabCard).toHaveScreenshot('vocab-card-desktop.png', {
      maxDiffPixels: 100,
    });
  });

  test('VocabCard visual appearance (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/activities/thanksgiving-gratitude');

    const vocabCard = page.locator('.vocab-card');
    await expect(vocabCard).toBeVisible();

    await expect(vocabCard).toHaveScreenshot('vocab-card-mobile.png', {
      maxDiffPixels: 100,
    });
  });

  test('PhrasesCard visual appearance (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    const phrasesCard = page.locator('.phrases-card');
    await expect(phrasesCard).toBeVisible();

    await expect(phrasesCard).toHaveScreenshot('phrases-card-desktop.png', {
      maxDiffPixels: 100,
    });
  });

  test('SuppliesCard visual appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    const suppliesCard = page.locator('.supplies-card');
    await expect(suppliesCard).toBeVisible();

    await expect(suppliesCard).toHaveScreenshot('supplies-card.png', {
      maxDiffPixels: 100,
    });
  });

  test('InstructionsCard visual appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    const instructionsCard = page.locator('.instructions-card');
    await expect(instructionsCard).toBeVisible();

    await expect(instructionsCard).toHaveScreenshot('instructions-card.png', {
      maxDiffPixels: 100,
    });
  });

  test('TipsCard visual appearance (if present)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    const tipsCard = page.locator('.tips-card');
    const count = await tipsCard.count();

    if (count > 0) {
      await expect(tipsCard).toBeVisible();

      await expect(tipsCard).toHaveScreenshot('tips-card.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('full activity detail page (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    await expect(page).toHaveScreenshot('activity-page-desktop.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('full activity detail page (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/activities/thanksgiving-gratitude');

    await expect(page).toHaveScreenshot('activity-page-mobile.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });

  test('all cards stacked vertically (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/activities/thanksgiving-gratitude');

    // Screenshot the main content area showing card stacking
    const mainContent = page.locator('.activity-content');
    await expect(mainContent).toBeVisible();

    await expect(mainContent).toHaveScreenshot('cards-stacked-desktop.png', {
      fullPage: false,
      maxDiffPixels: 200,
    });
  });

  test('all cards stacked vertically (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/activities/thanksgiving-gratitude');

    const mainContent = page.locator('.activity-content');
    await expect(mainContent).toBeVisible();

    await expect(mainContent).toHaveScreenshot('cards-stacked-mobile.png', {
      fullPage: false,
      maxDiffPixels: 200,
    });
  });
});
