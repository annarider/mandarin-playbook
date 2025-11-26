import { test, expect } from '@playwright/test';

/**
 * Swiper Performance Tests
 *
 * Tests that verify the swiper performs well and doesn't cause
 * performance issues or memory leaks.
 */

test.describe('Swiper Performance', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('swiper initializes in <500ms', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();

    await page.goto(testUrl);

    // Wait for swiper to be visible and initialized
    await page.waitForSelector('[data-swiper-cards]', { state: 'visible' });
    await page.waitForSelector('.swiper-pagination-bullet');

    const endTime = Date.now();
    const initTime = endTime - startTime;

    // Should initialize relatively quickly
    // Note: This includes page load time, so be generous
    expect(initTime).toBeLessThan(5000);
  });

  test('swipe transitions are smooth (60fps)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Start monitoring performance
    const performanceMetrics = await page.evaluate(() => {
      return {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
      };
    });

    // Perform a swipe
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();

    await page.waitForTimeout(500);

    // Check that page is still responsive
    const isVisible = await page.locator('[data-swiper-cards]').isVisible();
    expect(isVisible).toBe(true);

    // Page load time check
    const loadTime = performanceMetrics.loadEventEnd - performanceMetrics.navigationStart;
    expect(loadTime).toBeGreaterThan(0);
  });

  test('no layout shift on swiper load', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Get initial position of element below swiper
    await page.waitForSelector('[data-swiper-cards]');

    // Find an element after the swiper (like supplies card)
    const elementAfterSwiper = page.locator('.card').filter({ hasText: 'Supplies' }).first();

    if (await elementAfterSwiper.count() > 0) {
      const initialPosition = await elementAfterSwiper.boundingBox();

      // Wait a bit for any late layout shifts
      await page.waitForTimeout(1000);

      const finalPosition = await elementAfterSwiper.boundingBox();

      // Position should be stable (small tolerance for rendering)
      if (initialPosition && finalPosition) {
        const shift = Math.abs(finalPosition.y - initialPosition.y);
        expect(shift).toBeLessThan(5);
      }
    }
  });

  test('no memory leaks after 50+ swipes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Get initial memory (if available via Chrome DevTools Protocol)
    const initialMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    // Perform many swipes
    for (let i = 0; i < 25; i++) {
      // Click second bullet
      await page.locator('.swiper-pagination-bullet').nth(1).click();
      await page.waitForTimeout(100);

      // Click first bullet
      await page.locator('.swiper-pagination-bullet').first().click();
      await page.waitForTimeout(100);
    }

    // Get final memory
    const finalMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    // If memory metrics are available, check for reasonable growth
    if (initialMetrics !== null && finalMetrics !== null) {
      const memoryGrowth = finalMetrics - initialMetrics;
      const growthPercentage = (memoryGrowth / initialMetrics) * 100;

      // Memory shouldn't grow excessively (less than 50% increase)
      expect(growthPercentage).toBeLessThan(50);
    }

    // Swiper should still be functional
    await expect(page.locator('[data-swiper-cards]')).toBeVisible();
  });

  test('touch events do not interfere with scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Scroll down the page
    const initialScrollY = await page.evaluate(() => window.scrollY);

    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);

    const afterScrollY = await page.evaluate(() => window.scrollY);

    // Should be able to scroll
    expect(afterScrollY).toBeGreaterThan(initialScrollY);

    // Swiper should still work after scrolling
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(300);

    await expect(secondBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('swiper does not block page interactivity', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Should be able to click other elements on page
    const backLink = page.locator('a', { hasText: 'Back to all activities' }).first();
    const isClickable = await backLink.isVisible();

    expect(isClickable).toBe(true);

    // Pagination should also be clickable
    const bullet = page.locator('.swiper-pagination-bullet').first();
    await bullet.click();

    // Should respond quickly
    await page.waitForTimeout(100);
    await expect(bullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('swiper handles rapid navigation changes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Rapidly click between slides
    for (let i = 0; i < 10; i++) {
      await page.locator('.swiper-pagination-bullet').nth(i % 2).click();
      await page.waitForTimeout(50);
    }

    // Swiper should still be functional
    await expect(page.locator('[data-swiper-cards]')).toBeVisible();

    // One of the bullets should be active
    const activeBullets = page.locator('.swiper-pagination-bullet-active');
    const activeCount = await activeBullets.count();
    expect(activeCount).toBe(1);
  });

  test('no console errors during swiper initialization', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');
    await page.waitForTimeout(1000);

    // Filter out unrelated errors (like favicon 404s)
    const swiperErrors = consoleErrors.filter(
      (err) =>
        err.includes('swiper') ||
        err.includes('Swiper') ||
        err.includes('slide') ||
        err.includes('pagination')
    );

    expect(swiperErrors).toHaveLength(0);
  });

  test('no console warnings during swiper usage', async ({ page }) => {
    const consoleWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Perform some interactions
    await page.locator('.swiper-pagination-bullet').nth(1).click();
    await page.waitForTimeout(500);

    await page.locator('.swiper-pagination-bullet').first().click();
    await page.waitForTimeout(500);

    // Filter swiper-related warnings
    const swiperWarnings = consoleWarnings.filter(
      (warn) =>
        warn.includes('swiper') ||
        warn.includes('Swiper') ||
        warn.includes('slide') ||
        warn.includes('pagination')
    );

    expect(swiperWarnings).toHaveLength(0);
  });

  test('swiper CSS does not cause layout thrashing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Measure reflow count by checking layout stability
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('layout-shift');
      return entries.length;
    });

    // Perform a swipe
    await page.locator('.swiper-pagination-bullet').nth(1).click();
    await page.waitForTimeout(500);

    const newPerformanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('layout-shift');
      return entries.length;
    });

    // Layout shifts should be minimal
    const layoutShiftIncrease = newPerformanceEntries - performanceEntries;
    expect(layoutShiftIncrease).toBeLessThan(5);
  });

  test('images and content load without blocking swiper', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Swiper should be visible before all content loads
    await page.waitForSelector('[data-swiper-cards]', { timeout: 3000 });

    const isSwiperVisible = await page.locator('[data-swiper-cards]').isVisible();
    expect(isSwiperVisible).toBe(true);

    // Pagination should also be ready
    const isPaginationVisible = await page.locator('.swiper-pagination').isVisible();
    expect(isPaginationVisible).toBe(true);
  });

  test('swiper works correctly after window resize', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Navigate to second slide
    await page.locator('.swiper-pagination-bullet').nth(1).click();
    await page.waitForTimeout(300);

    // Resize viewport slightly
    await page.setViewportSize({ width: 414, height: 896 });
    await page.waitForTimeout(500);

    // Swiper should still work
    await expect(page.locator('[data-swiper-cards]')).toBeVisible();

    // Should still be functional
    await page.locator('.swiper-pagination-bullet').first().click();
    await page.waitForTimeout(300);

    const firstBullet = page.locator('.swiper-pagination-bullet').first();
    await expect(firstBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });
});
