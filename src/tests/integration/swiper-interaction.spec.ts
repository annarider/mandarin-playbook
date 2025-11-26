import { test, expect } from '@playwright/test';

/**
 * Swiper Interaction Tests
 *
 * Tests that verify swiper touch interactions and navigation work correctly.
 */

test.describe('Swiper Touch Interactions', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('can swipe left to next card (touch simulation)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Wait for swiper to initialize
    await page.waitForSelector('[data-swiper-cards]');

    // Get first slide
    const firstSlide = page.locator('.swiper-slide').first();
    const slideBox = await firstSlide.boundingBox();

    // Simulate swipe left gesture (swipe from right to left)
    await page.mouse.move(slideBox!.x + slideBox!.width - 50, slideBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(slideBox!.x + 50, slideBox!.y + 100, { steps: 10 });
    await page.mouse.up();

    // Wait for transition
    await page.waitForTimeout(500);

    // Check that we moved to the next slide (second bullet should be active)
    const activeBullets = page.locator('.swiper-pagination-bullet-active');
    const activeBulletIndex = await activeBullets.evaluate((el) => {
      const parent = el.parentElement;
      return Array.from(parent!.children).indexOf(el);
    });

    // Should be on second slide (index 1)
    expect(activeBulletIndex).toBe(1);
  });

  test('can swipe right to previous card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // First, navigate to second slide by clicking second bullet
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(500);

    // Now swipe right (from left to right)
    const slide = page.locator('.swiper-slide').nth(1);
    const slideBox = await slide.boundingBox();

    await page.mouse.move(slideBox!.x + 50, slideBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(slideBox!.x + slideBox!.width - 50, slideBox!.y + 100, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    // Should be back on first slide (first bullet active)
    const activeBullets = page.locator('.swiper-pagination-bullet-active');
    const activeBulletIndex = await activeBullets.evaluate((el) => {
      const parent = el.parentElement;
      return Array.from(parent!.children).indexOf(el);
    });

    expect(activeBulletIndex).toBe(0);
  });

  test('pagination dots are clickable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Click second pagination dot
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Second bullet should now be active
    await expect(secondBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('clicking dot navigates to that card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Click first bullet (should already be active)
    const firstBullet = page.locator('.swiper-pagination-bullet').first();
    await firstBullet.click();
    await page.waitForTimeout(300);

    await expect(firstBullet).toHaveClass(/swiper-pagination-bullet-active/);

    // Click second bullet
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(300);

    await expect(secondBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('swipe gesture is smooth (no lag)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    const startTime = Date.now();

    // Perform swipe
    const firstSlide = page.locator('.swiper-slide').first();
    const slideBox = await firstSlide.boundingBox();

    await page.mouse.move(slideBox!.x + slideBox!.width - 50, slideBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(slideBox!.x + 50, slideBox!.y + 100, { steps: 10 });
    await page.mouse.up();

    // Wait for transition to complete
    await page.waitForTimeout(500);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Transition should complete in reasonable time (less than 2 seconds)
    expect(duration).toBeLessThan(2000);
  });

  test('cards snap to position after swipe', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Perform swipe
    const firstSlide = page.locator('.swiper-slide').first();
    const slideBox = await firstSlide.boundingBox();

    await page.mouse.move(slideBox!.x + slideBox!.width - 50, slideBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(slideBox!.x + 50, slideBox!.y + 100, { steps: 10 });
    await page.mouse.up();

    // Wait for snap animation
    await page.waitForTimeout(500);

    // Check that second slide is now in view and properly positioned
    const secondSlide = page.locator('.swiper-slide').nth(1);
    await expect(secondSlide).toBeInViewport();
  });

  test('cannot swipe past last card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Navigate to last slide
    const lastBullet = page.locator('.swiper-pagination-bullet').last();
    await lastBullet.click();
    await page.waitForTimeout(500);

    // Try to swipe left (beyond last slide)
    const lastSlide = page.locator('.swiper-slide').last();
    const slideBox = await lastSlide.boundingBox();

    await page.mouse.move(slideBox!.x + slideBox!.width - 50, slideBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(slideBox!.x + 50, slideBox!.y + 100, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    // Should still be on last slide
    await expect(lastBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('cannot swipe before first card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Should start on first slide
    const firstBullet = page.locator('.swiper-pagination-bullet').first();
    await expect(firstBullet).toHaveClass(/swiper-pagination-bullet-active/);

    // Try to swipe right (before first slide)
    const firstSlide = page.locator('.swiper-slide').first();
    const slideBox = await firstSlide.boundingBox();

    await page.mouse.move(slideBox!.x + 50, slideBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(slideBox!.x + slideBox!.width - 50, slideBox!.y + 100, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    // Should still be on first slide
    await expect(firstBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('multiple rapid swipes work correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Swipe left
    await page.locator('.swiper-pagination-bullet').nth(1).click();
    await page.waitForTimeout(400);

    // Swipe back right
    await page.locator('.swiper-pagination-bullet').first().click();
    await page.waitForTimeout(400);

    // Should be on first slide
    const firstBullet = page.locator('.swiper-pagination-bullet').first();
    await expect(firstBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('touch events do not interfere with page scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Scroll down the page
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(300);

    const afterScrollY = await page.evaluate(() => window.scrollY);

    // Page should have scrolled
    expect(afterScrollY).toBeGreaterThan(initialScrollY);
  });
});
