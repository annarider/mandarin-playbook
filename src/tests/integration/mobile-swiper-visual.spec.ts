import { test, expect } from '@playwright/test';

/**
 * Mobile Swiper Visual Tests
 *
 * Tests that verify the swiper displays correctly on mobile viewports
 * and is hidden on desktop viewports.
 */

test.describe('Mobile Swiper Visual Display', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('swiper displays on mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Wait for swiper to initialize
    await page.waitForSelector('.mobile-swiper-container', { state: 'visible' });

    // Swiper container should be visible
    const swiperContainer = page.locator('.mobile-swiper-container');
    await expect(swiperContainer).toBeVisible();

    // Swiper element should exist
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('swiper does NOT display on desktop (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(testUrl);

    // Mobile swiper should not exist in DOM
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    // Desktop cards should be visible
    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('swiper does NOT display on desktop (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(testUrl);

    // Mobile swiper should not exist in DOM
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    // Desktop cards should be visible
    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('pagination dots are visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Wait for pagination to render
    const pagination = page.locator('.swiper-pagination');
    await expect(pagination).toBeVisible();
  });

  test('correct number of pagination dots (matches card count)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Wait for pagination bullets to render
    await page.waitForSelector('.swiper-pagination-bullet');

    // Count pagination bullets
    const bullets = page.locator('.swiper-pagination-bullet');
    const bulletCount = await bullets.count();

    // Should have 2 dots (vocab + phrases)
    expect(bulletCount).toBe(2);
  });

  test('active dot highlights current slide', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Wait for active bullet
    const activeBullet = page.locator('.swiper-pagination-bullet-active');
    await expect(activeBullet).toBeVisible();

    // Should have exactly one active bullet
    const activeBulletCount = await activeBullet.count();
    expect(activeBulletCount).toBe(1);
  });

  test('cards are full-width on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Get swiper slide
    const slide = page.locator('.swiper-slide').first();
    const slideBox = await slide.boundingBox();

    // Get viewport width
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Slide should be close to full viewport width (accounting for padding)
    expect(slideBox!.width).toBeGreaterThan(viewportWidth * 0.85);
  });

  test('text is large and readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Wait for content to render
    await page.waitForSelector('.chinese');

    // Check Chinese text size
    const chineseText = page.locator('.chinese').first();
    const fontSize = await chineseText.evaluate((el) =>
      parseInt(window.getComputedStyle(el).fontSize)
    );

    // Should be at least 18px for readability
    expect(fontSize).toBeGreaterThanOrEqual(18);
  });

  test('swiper container has proper structure', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Check structure exists
    await expect(page.locator('.mobile-swiper-container')).toBeVisible();
    await expect(page.locator('[data-swiper-cards]')).toBeVisible();
    await expect(page.locator('.swiper-wrapper')).toBeVisible();
    await expect(page.locator('.swiper-slide')).toHaveCount(2);
  });

  test('swiper displays on small mobile (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(testUrl);

    // Swiper should still work on very small screens
    const swiperContainer = page.locator('.mobile-swiper-container');
    await expect(swiperContainer).toBeVisible();
  });

  test('swiper displays on large mobile (414px)', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto(testUrl);

    // Swiper should work on larger mobile screens
    const swiperContainer = page.locator('.mobile-swiper-container');
    await expect(swiperContainer).toBeVisible();
  });

  test('pagination dots are centered', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    const pagination = page.locator('.swiper-pagination');
    const textAlign = await pagination.evaluate((el) =>
      window.getComputedStyle(el).textAlign
    );

    // Pagination should be centered
    expect(textAlign).toBe('center');
  });

  test('slides have proper spacing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    const slides = page.locator('.swiper-slide');
    expect(await slides.count()).toBeGreaterThan(0);

    // All slides should be present in the DOM
    const slideCount = await slides.count();
    expect(slideCount).toBe(2);
  });
});
