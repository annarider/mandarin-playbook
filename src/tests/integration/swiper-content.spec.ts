import { test, expect } from '@playwright/test';

/**
 * Swiper Content Display Tests
 *
 * Tests that verify vocabulary and phrases content displays correctly
 * within the swiper slides.
 */

test.describe('Swiper Content Display', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('VocabCard content displays correctly in swiper', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // First slide should be vocab (based on order in component)
    const firstSlide = page.locator('.swiper-slide').first();

    // Should have vocab card heading
    const heading = firstSlide.locator('h2');
    await expect(heading).toContainText('Vocabulary');

    // Should have vocab list
    const vocabList = firstSlide.locator('.vocab-list');
    await expect(vocabList).toBeVisible();
  });

  test('PhrasesCard content displays correctly in swiper', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Navigate to second slide (phrases)
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(500);

    const secondSlide = page.locator('.swiper-slide').nth(1);

    // Should have phrases card heading
    const heading = secondSlide.locator('h2');
    await expect(heading).toContainText('Phrases');

    // Should have phrases list
    const phrasesList = secondSlide.locator('.phrases-list');
    await expect(phrasesList).toBeVisible();
  });

  test('Chinese characters are properly sized in swiper', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.chinese');

    // Check Chinese character size
    const chineseText = page.locator('.chinese').first();
    const fontSize = await chineseText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );

    // Should be large enough to read easily on mobile
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });

  test('all vocab items visible when slide is active', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Get all vocab items in first slide
    const vocabItems = page.locator('.swiper-slide').first().locator('.vocab-item');
    const vocabCount = await vocabItems.count();

    // Should have at least one vocab item
    expect(vocabCount).toBeGreaterThan(0);

    // Each vocab item should have all required fields visible
    for (let i = 0; i < vocabCount; i++) {
      const item = vocabItems.nth(i);
      await expect(item.locator('.chinese')).toBeVisible();
      await expect(item.locator('.pinyin')).toBeVisible();
      await expect(item.locator('.english')).toBeVisible();
    }
  });

  test('all phrase items visible when slide is active', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Navigate to phrases slide
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(500);

    // Get all phrase items in second slide
    const phraseItems = page.locator('.swiper-slide').nth(1).locator('.phrase-item');
    const phraseCount = await phraseItems.count();

    // Should have at least one phrase item
    expect(phraseCount).toBeGreaterThan(0);

    // Each phrase item should have all required fields visible
    for (let i = 0; i < phraseCount; i++) {
      const item = phraseItems.nth(i);
      await expect(item.locator('.chinese')).toBeVisible();
      await expect(item.locator('.pinyin')).toBeVisible();
      await expect(item.locator('.english')).toBeVisible();
    }
  });

  test('content does not overflow slide boundaries', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Check first slide
    const firstSlide = page.locator('.swiper-slide').first();
    const slideBox = await firstSlide.boundingBox();

    // Check that vocab items are within slide bounds
    const vocabItems = firstSlide.locator('.vocab-item');
    const count = await vocabItems.count();

    for (let i = 0; i < count; i++) {
      const item = vocabItems.nth(i);
      const itemBox = await item.boundingBox();

      // Item should be within slide width
      expect(itemBox!.x).toBeGreaterThanOrEqual(slideBox!.x - 5); // Small tolerance
      expect(itemBox!.x + itemBox!.width).toBeLessThanOrEqual(slideBox!.x + slideBox!.width + 5);
    }
  });

  test('pinyin text is italicized', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.pinyin');

    const pinyinText = page.locator('.pinyin').first();
    const fontStyle = await pinyinText.evaluate((el) =>
      window.getComputedStyle(el).fontStyle
    );

    expect(fontStyle).toBe('italic');
  });

  test('traditional characters display in parentheses when present', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Check if any vocab items have traditional characters
    const traditionalSpans = page.locator('.traditional');
    const count = await traditionalSpans.count();

    if (count > 0) {
      // If traditional characters exist, they should contain parentheses
      const firstTraditional = traditionalSpans.first();
      const text = await firstTraditional.textContent();
      expect(text).toMatch(/^\(/); // Starts with (
      expect(text).toMatch(/\)$/); // Ends with )
    }
  });

  test('vocab items have proper spacing between them', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.vocab-item');

    const vocabItems = page.locator('.swiper-slide').first().locator('.vocab-item');
    const count = await vocabItems.count();

    if (count > 1) {
      // Get first two items
      const firstItem = vocabItems.first();
      const secondItem = vocabItems.nth(1);

      const firstBox = await firstItem.boundingBox();
      const secondBox = await secondItem.boundingBox();

      // Items should not overlap
      expect(secondBox!.y).toBeGreaterThan(firstBox!.y);
    }
  });

  test('card headings are styled correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    const heading = page.locator('.swiper-slide h2').first();

    // Check heading color
    const color = await heading.evaluate((el) =>
      window.getComputedStyle(el).color
    );

    // Should be the brand red color (rgb(196, 30, 58) = #c41e3a)
    expect(color).toBe('rgb(196, 30, 58)');

    // Check heading has border
    const borderBottomWidth = await heading.evaluate((el) =>
      window.getComputedStyle(el).borderBottomWidth
    );

    expect(borderBottomWidth).toBe('2px');
  });

  test('english translations are visible and readable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.english');

    const englishText = page.locator('.english').first();

    // Should be visible
    await expect(englishText).toBeVisible();

    // Should have readable font size
    const fontSize = await englishText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );

    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test('content maintains readability on smallest mobile size', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // All text should still be visible and readable
    const chineseText = page.locator('.chinese').first();
    const pinyinText = page.locator('.pinyin').first();
    const englishText = page.locator('.english').first();

    await expect(chineseText).toBeVisible();
    await expect(pinyinText).toBeVisible();
    await expect(englishText).toBeVisible();

    // Font sizes should still be reasonable
    const chineseFontSize = await chineseText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );
    expect(chineseFontSize).toBeGreaterThanOrEqual(16);
  });
});
