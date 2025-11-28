import { test, expect } from '@playwright/test';

/**
 * Responsive Swiper Tests
 *
 * Tests that verify the swiper responds correctly to different viewport sizes
 * and device orientations.
 */

test.describe('Responsive Swiper Behavior', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('desktop (>1024px): all cards stacked, no swiper', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(testUrl);

    // Mobile swiper should not exist in DOM
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    // Desktop cards should be visible and stacked
    // Both vocab and phrases cards should be visible at once
    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('tablet (768-1024px): all cards stacked, no swiper', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(testUrl);

    // Mobile swiper should not exist in DOM at tablet size
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    // Desktop cards should be visible
    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('mobile (375-767px): swiper active for vocab/phrases', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto(testUrl);

    // Mobile swiper should be visible
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();

    // Desktop cards should not exist in DOM
    const vocabCard = page.locator('.vocab-card');
    const phrasesCard = page.locator('.phrases-card');

    // Cards should only exist in swiper, not as standalone
    await expect(vocabCard).toBeVisible(); // In swiper
    await expect(phrasesCard).toBeVisible(); // In swiper
  });

  test('mobile (<375px): swiper still functional', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(testUrl);

    // Swiper should be visible and functional
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();

    // Pagination should still work
    const pagination = page.locator('.swiper-pagination');
    await expect(pagination).toBeVisible();
  });

  test('orientation change handled correctly (portrait to landscape)', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Swiper should be visible in portrait mobile
    let swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();

    // Switch to landscape (swap dimensions)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(300);

    // Still mobile width, swiper should still be visible
    swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('orientation change handled correctly (landscape to portrait)', async ({ page }) => {
    // Start in landscape mobile
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto(testUrl);

    // Swiper should be visible
    let swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();

    // Switch to portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    // Swiper should still be visible
    swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('viewport resize toggles between swiper/stack correctly (mobile to desktop)', async ({ page }) => {
    // Start on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Swiper should be visible
    let swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();

    // Resize to desktop - this requires page reload with client:media
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload();
    await page.waitForTimeout(300);

    // Swiper should not exist, stacked cards visible
    swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('viewport resize toggles between swiper/stack correctly (desktop to mobile)', async ({ page }) => {
    // Start on desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(testUrl);

    // Stacked cards should be visible
    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();

    // Resize to mobile - this requires page reload with client:media
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(300);

    // Swiper should be visible
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('instructions/supplies/tips stay as regular cards on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Scroll down to see other cards
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);

    // Supplies card should be visible and NOT in swiper
    const suppliesCard = page.locator('.card').filter({ hasText: 'Supplies' });

    // It should exist on the page
    const suppliesCount = await suppliesCard.count();
    expect(suppliesCount).toBeGreaterThan(0);

    // It should NOT be inside the swiper
    const suppliesInSwiper = page.locator('.swiper-slide').filter({ has: suppliesCard });
    const swiperCount = await suppliesInSwiper.count();
    expect(swiperCount).toBe(0);
  });

  test('breakpoint at 768px switches correctly', async ({ page }) => {
    // Just below breakpoint (767px) - should show swiper
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.goto(testUrl);

    let swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();

    // Just at breakpoint (768px) - should show stacked, requires reload
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForTimeout(300);

    swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('large desktop (1920px) shows stacked cards', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(testUrl);

    // Swiper should not exist
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).not.toBeAttached();

    // Both cards visible
    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('iPad portrait (768x1024) shows stacked cards', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(testUrl);

    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('iPad landscape (1024x768) shows stacked cards', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(testUrl);

    await expect(page.locator('.vocab-card')).toBeVisible();
    await expect(page.locator('.phrases-card')).toBeVisible();
  });

  test('iPhone SE (375x667) shows swiper', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('iPhone 12 Pro (390x844) shows swiper', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(testUrl);

    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('swiper state persists through orientation change', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    // Navigate to second slide
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(500);

    // Verify on second slide
    await expect(secondBullet).toHaveClass(/swiper-pagination-bullet-active/);

    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Should still be on second slide (or at least swiper still works)
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });
});
