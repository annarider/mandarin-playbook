import { test, expect } from '@playwright/test';

test.describe('Activity Detail Pages', () => {
  test('should load thanksgiving-gratitude activity detail page', async ({ page }) => {
    const response = await page.goto('/activities/thanksgiving-gratitude');
    expect(response?.status()).toBe(200);
  });

  test('should load counting-game activity detail page', async ({ page }) => {
    const response = await page.goto('/activities/counting-game');
    expect(response?.status()).toBe(200);
  });

  test('should load mid-autumn-story activity detail page', async ({ page }) => {
    const response = await page.goto('/activities/mid-autumn-story');
    expect(response?.status()).toBe(200);
  });

  test('should display correct activity title', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');
    const heading = await page.locator('h1');
    await expect(heading).toHaveText('Thanksgiving Gratitude Circle');
  });

  test('should display metadata correctly', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for metadata section
    const metadata = await page.locator('.metadata');
    await expect(metadata).toBeVisible();

    // Check specific metadata fields (new labels)
    await expect(page.locator('text=Age:')).toBeVisible();
    await expect(page.locator('text=Duration:')).toBeVisible();
    await expect(page.locator('text=Level:')).toBeVisible();
  });

  test('should display vocabulary items with Chinese, pinyin, and English', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for vocabulary section (updated to use vocab-card class)
    const vocabSection = page.locator('.vocab-card');
    await expect(vocabSection).toBeVisible();

    // Check for vocabulary heading
    await expect(page.locator('.vocab-card h2')).toHaveText('Vocabulary');

    // Check that vocabulary items are displayed
    const vocabList = page.locator('.vocab-card ul li');
    const count = await vocabList.count();
    expect(count).toBeGreaterThan(0);

    // Check structure of first vocab item (should have Chinese, pinyin, English)
    const firstVocab = vocabList.first();
    const text = await firstVocab.textContent();
    expect(text).toBeTruthy();
    // Should contain Chinese characters, pinyin, and English
    expect(text).toMatch(/[\u4e00-\u9fa5]/); // Chinese characters
  });

  test('should display phrases with Chinese, pinyin, and English', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for phrases section (updated to use phrases-card class)
    const phrasesSection = page.locator('.phrases-card');
    await expect(phrasesSection).toBeVisible();

    // Check for phrases heading
    await expect(page.locator('.phrases-card h2')).toHaveText('Phrases');

    // Check that phrase items are displayed
    const phrasesList = page.locator('.phrases-card ul li');
    const count = await phrasesList.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display supplies list when present', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for supplies section (updated to use supplies-card class)
    const suppliesSection = page.locator('.supplies-card');
    await expect(suppliesSection).toBeVisible();

    // Check for supplies heading
    await expect(page.locator('.supplies-card h2')).toHaveText('Supplies Needed');

    // Check that supplies are listed
    const suppliesList = page.locator('.supplies-card ul li');
    const count = await suppliesList.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should not display vocabulary section for activities without vocab', async ({ page }) => {
    await page.goto('/activities/counting-game');

    // Counting game doesn't have vocabulary field (updated to use vocab-card class)
    const vocabSection = page.locator('.vocab-card');
    await expect(vocabSection).not.toBeVisible();
  });

  test('should display printable download link when present', async ({ page }) => {
    await page.goto('/activities/mid-autumn-story');

    // Check for printable section
    const printableSection = await page.locator('.printable');
    await expect(printableSection).toBeVisible();

    // Check for printable heading
    await expect(page.locator('.printable h2')).toHaveText('Printable');

    // Check for download link
    const downloadLink = await page.locator('.printable a');
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('href', '/printables/change-coloring.pdf');
    await expect(downloadLink).toHaveAttribute('target', '_blank');
  });

  test('should render markdown content in the content section', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for content section (updated to use instructions-card class)
    const contentSection = page.locator('.instructions-card');
    await expect(contentSection).toBeVisible();

    // Check that content has been rendered (should have headings, paragraphs, etc.)
    const headings = contentSection.locator('h2');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display tags when present', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for tags section (updated to use tags-section class)
    const tagsSection = page.locator('.tags-section');
    await expect(tagsSection).toBeVisible();

    const tagsText = await tagsSection.textContent();
    expect(tagsText).toContain('Tags:');
  });

  test('should have back to home links', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Check for back links
    const backLinks = await page.locator('a:has-text("← Back to all activities")');
    const count = await backLinks.count();
    expect(count).toBeGreaterThan(0); // Should have at least one back link

    // Verify href points to home
    const firstBackLink = backLinks.first();
    await expect(firstBackLink).toHaveAttribute('href', '/');
  });

  test('should navigate back to homepage when clicking back link', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');

    // Click back link
    await page.click('a:has-text("← Back to all activities")');

    // Wait for navigation
    await page.waitForURL('/');

    // Verify we're on the homepage (use first h1 to avoid strict mode violation)
    const heading = page.locator('h1').first();
    await expect(heading).toHaveText('Mandarin Homeschool Activities');
  });

  test('should have proper page title for activity detail page', async ({ page }) => {
    await page.goto('/activities/thanksgiving-gratitude');
    await expect(page).toHaveTitle('Thanksgiving Gratitude Circle - Mandarin Homeschool Activities');
  });

  test('should return 404 for non-existent activity slug', async ({ page }) => {
    const response = await page.goto('/activities/non-existent-activity');
    expect(response?.status()).toBe(404);
  });

  test('should have no console errors on activity detail page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/activities/thanksgiving-gratitude');

    expect(consoleErrors).toHaveLength(0);
  });

  test('should display all required metadata fields for each activity', async ({ page }) => {
    const activities = ['thanksgiving-gratitude', 'counting-game', 'mid-autumn-story'];

    for (const activity of activities) {
      await page.goto(`/activities/${activity}`);

      // Verify all required metadata is present (updated labels)
      await expect(page.locator('.description')).toBeVisible(); // Description is now a separate paragraph
      await expect(page.locator('text=Age:')).toBeVisible();
      await expect(page.locator('text=Duration:')).toBeVisible();
      await expect(page.locator('text=Level:')).toBeVisible();
    }
  });
});
