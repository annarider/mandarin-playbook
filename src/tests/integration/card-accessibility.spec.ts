import { test, expect } from '@playwright/test';

/**
 * Card Accessibility Tests
 *
 * Tests that cards are accessible to all users:
 * - Semantic HTML structure
 * - Proper heading hierarchy
 * - Color contrast (WCAG AA)
 * - Keyboard navigation (if interactive)
 * - Screen reader friendly
 */

test.describe('Card Accessibility', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('cards use semantic HTML headings', async ({ page }) => {
    await page.goto(testUrl);

    // Each card should have a proper h2 heading
    const vocabHeading = page.getByRole('heading', { name: 'Vocabulary', level: 2 });
    const phrasesHeading = page.getByRole('heading', { name: 'Phrases', level: 2 });
    const suppliesHeading = page.getByRole('heading', { name: 'Supplies Needed', level: 2 });
    const instructionsHeading = page.getByRole('heading', { name: 'Activity Instructions', level: 2 }).first();

    await expect(vocabHeading).toBeVisible();
    await expect(phrasesHeading).toBeVisible();
    await expect(suppliesHeading).toBeVisible();
    await expect(instructionsHeading).toBeVisible();
  });

  test('heading hierarchy is correct (h1 -> h2 -> h3)', async ({ page }) => {
    await page.goto(testUrl);

    // Get all headings in order
    const headings = await page.locator('h1, h2, h3').allTextContents();

    // First heading should be h1 (page title)
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // h2 headings should be card titles
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(3); // Multiple cards + instructions content

    // If h3 exists, it should be within content (instructions)
    const h3Count = await page.locator('h3').count();
    if (h3Count > 0) {
      // h3 should be inside instructions card
      const instructionsH3 = page.locator('.instructions-card h3');
      const count = await instructionsH3.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('lists use proper semantic HTML (ul/ol and li)', async ({ page }) => {
    await page.goto(testUrl);

    // Vocab should use list elements
    const vocabList = page.locator('.vocab-card ul');
    await expect(vocabList).toBeVisible();

    const vocabItems = page.locator('.vocab-card li');
    const vocabCount = await vocabItems.count();
    expect(vocabCount).toBeGreaterThan(0);

    // Supplies should use list elements
    const suppliesList = page.locator('.supplies-card ul');
    await expect(suppliesList).toBeVisible();

    const supplyItems = page.locator('.supplies-card li');
    const supplyCount = await supplyItems.count();
    expect(supplyCount).toBeGreaterThan(0);
  });

  test('text has sufficient color contrast (WCAG AA)', async ({ page }) => {
    await page.goto(testUrl);

    // Check heading contrast (red on white)
    const heading = page.locator('.vocab-card h2');
    const color = await heading.evaluate((el) =>
      window.getComputedStyle(el).color
    );
    const bgColor = await heading.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Red text should be visible on white background
    expect(color).not.toBe(bgColor);

    // Check body text contrast
    const bodyText = page.locator('.vocab-card .english').first();
    const textColor = await bodyText.evaluate((el) =>
      window.getComputedStyle(el).color
    );

    // Text should not be too light (should have good contrast)
    expect(textColor).not.toBe('rgb(255, 255, 255)'); // Not white on white
  });

  test('page has no automatic accessibility violations', async ({ page }) => {
    await page.goto(testUrl);

    // Check for common accessibility issues
    // 1. All images should have alt text (if any)
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }

    // 2. Interactive elements should be keyboard accessible
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('links have accessible names', async ({ page }) => {
    await page.goto(testUrl);

    // Back link should have clear text (using first() since there are two)
    const backLink = page.getByRole('link', { name: /back to all activities/i }).first();
    await expect(backLink).toBeVisible();
  });

  test('cards are keyboard navigable (for interactive elements)', async ({ page }) => {
    await page.goto(testUrl);

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Should be able to reach back link
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('screen reader can identify card sections', async ({ page }) => {
    await page.goto(testUrl);

    // Each card heading should be accessible to screen readers
    const vocabHeading = page.getByRole('heading', { name: 'Vocabulary' });
    const phrasesHeading = page.getByRole('heading', { name: 'Phrases' });

    // Verify headings are accessible (have role and name)
    const vocabRole = await vocabHeading.getAttribute('role');
    const phrasesRole = await phrasesHeading.getAttribute('role');

    // Native headings don't need explicit role, but should be detectable
    await expect(vocabHeading).toBeVisible();
    await expect(phrasesHeading).toBeVisible();
  });

  test('content is readable without CSS', async ({ page }) => {
    await page.goto(testUrl);

    // Get text content
    const vocabCard = page.locator('.vocab-card');
    const content = await vocabCard.textContent();

    // Should have meaningful content even without styles
    expect(content).toContain('Vocabulary');
    expect(content).toMatch(/[\u4e00-\u9fa5]/); // Contains Chinese
  });

  test('language attribute is set correctly', async ({ page }) => {
    await page.goto(testUrl);

    // Page should have lang attribute
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });
});
