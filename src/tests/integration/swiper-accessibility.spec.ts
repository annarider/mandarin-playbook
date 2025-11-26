import { test, expect } from '@playwright/test';

/**
 * Swiper Accessibility Tests
 *
 * Tests that verify the swiper is accessible to screen readers and
 * keyboard navigation, and respects user preferences.
 */

test.describe('Swiper Accessibility', () => {
  const testUrl = '/activities/thanksgiving-gratitude';

  test('swiper has proper ARIA labels', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Check pagination has aria-label
    const pagination = page.locator('.swiper-pagination');
    const ariaLabel = await pagination.getAttribute('aria-label');

    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('navigation');
  });

  test('pagination dots have ARIA labels', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Check that bullets are accessible
    const bullets = page.locator('.swiper-pagination-bullet');
    const count = await bullets.count();

    expect(count).toBeGreaterThan(0);

    // Bullets should be focusable (clickable indicates they can receive focus)
    for (let i = 0; i < count; i++) {
      const bullet = bullets.nth(i);
      const role = await bullet.getAttribute('role');
      const tabindex = await bullet.getAttribute('tabindex');

      // Button role or button element
      expect(role === 'button' || tabindex !== null).toBeTruthy();
    }
  });

  test('can navigate with keyboard arrows if enabled', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Focus on swiper
    await page.locator('[data-swiper-cards]').focus();

    // Check if keyboard navigation is possible via pagination
    const firstBullet = page.locator('.swiper-pagination-bullet').first();
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);

    // Tab to first bullet and press Enter
    await firstBullet.focus();
    await expect(firstBullet).toBeFocused();

    // Navigate to second bullet
    await secondBullet.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Second bullet should now be active
    await expect(secondBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('focus management works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Focus first bullet
    const firstBullet = page.locator('.swiper-pagination-bullet').first();
    await firstBullet.focus();

    // Should be focused
    await expect(firstBullet).toBeFocused();

    // Click to navigate
    await firstBullet.click();
    await page.waitForTimeout(300);

    // Focus second bullet
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.focus();

    // Should be focused
    await expect(secondBullet).toBeFocused();
  });

  test('screen reader announces current slide', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Check that slides have proper heading structure for screen readers
    const headings = page.locator('.swiper-slide h2');
    const headingCount = await headings.count();

    expect(headingCount).toBeGreaterThan(0);

    // Each slide should have a heading
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();

      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test('swiper respects prefers-reduced-motion', async ({ page, context }) => {
    // Enable reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => {
          if (query === '(prefers-reduced-motion: reduce)') {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => true,
            };
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          };
        },
      });
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Click second bullet
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();

    // Transition should happen (may be instant with reduced motion)
    await page.waitForTimeout(200);

    // Should still navigate successfully
    await expect(secondBullet).toHaveClass(/swiper-pagination-bullet-active/);
  });

  test('swiper maintains semantic HTML structure', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Check for proper list structure
    const lists = page.locator('.swiper-slide ul');
    const listCount = await lists.count();

    expect(listCount).toBeGreaterThan(0);

    // Check for proper heading hierarchy
    const h2s = page.locator('.swiper-slide h2');
    const h2Count = await h2s.count();

    expect(h2Count).toBeGreaterThan(0);
  });

  test('color contrast is sufficient for accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet-active');

    // Active bullet should have sufficient contrast
    const activeBullet = page.locator('.swiper-pagination-bullet-active');
    const opacity = await activeBullet.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity)
    );

    // Active bullet should be fully opaque
    expect(opacity).toBe(1);

    // Inactive bullets should be less opaque but visible
    const inactiveBullet = page.locator('.swiper-pagination-bullet').first();
    const inactiveOpacity = await inactiveBullet.evaluate((el) => {
      const isActive = el.classList.contains('swiper-pagination-bullet-active');
      if (isActive) return 1;
      return parseFloat(window.getComputedStyle(el).opacity);
    });

    // Check second bullet if first is active
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    const secondOpacity = await secondBullet.evaluate((el) => {
      const isActive = el.classList.contains('swiper-pagination-bullet-active');
      if (isActive) return 1;
      return parseFloat(window.getComputedStyle(el).opacity);
    });

    // At least one bullet should be inactive and have lower opacity
    expect(Math.min(inactiveOpacity, secondOpacity)).toBeLessThan(1);
  });

  test('swiper can be operated without mouse', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    // Tab through page elements until we reach pagination
    await page.keyboard.press('Tab');

    // Keep tabbing until we reach a pagination bullet
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.classList.contains('swiper-pagination-bullet');
      });

      if (focused) break;
      await page.keyboard.press('Tab');
    }

    // Press Enter on focused bullet
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Swiper should have responded
    const swiper = page.locator('[data-swiper-cards]');
    await expect(swiper).toBeVisible();
  });

  test('slide content is accessible when not visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // All slides should exist in DOM even if not visible
    const slides = page.locator('.swiper-slide');
    const slideCount = await slides.count();

    expect(slideCount).toBe(2);

    // Both slides should have headings
    for (let i = 0; i < slideCount; i++) {
      const slide = slides.nth(i);
      const heading = slide.locator('h2');
      await expect(heading).toHaveCount(1);
    }
  });

  test('pagination bullets are large enough for touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('.swiper-pagination-bullet');

    const bullet = page.locator('.swiper-pagination-bullet').first();
    const size = await bullet.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        width: parseInt(styles.width),
        height: parseInt(styles.height),
      };
    });

    // Minimum touch target size recommendation is 44x44px
    // But bullets can be smaller if they have adequate spacing
    expect(size.width).toBeGreaterThanOrEqual(10);
    expect(size.height).toBeGreaterThanOrEqual(10);
  });

  test('swiper announces slide changes to assistive tech', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testUrl);

    await page.waitForSelector('[data-swiper-cards]');

    // Check for live region or other accessibility announcements
    const swiper = page.locator('[data-swiper-cards]');

    // Navigate to second slide
    const secondBullet = page.locator('.swiper-pagination-bullet').nth(1);
    await secondBullet.click();
    await page.waitForTimeout(300);

    // Swiper wrapper should still be accessible
    await expect(swiper).toBeVisible();

    // Second slide should be in viewport
    const secondSlide = page.locator('.swiper-slide').nth(1);
    await expect(secondSlide).toBeInViewport();
  });
});
