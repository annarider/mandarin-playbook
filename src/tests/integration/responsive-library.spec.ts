import { test, expect } from '@playwright/test';

test.describe('Responsive Library Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.activity-grid');
  });

  test('grid shows 3 columns on desktop (>1024px)', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    const grid = page.locator('.activity-grid');

    // Check grid-template-columns
    const gridColumns = await grid.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 3 columns (3 values in grid-template-columns)
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('grid shows 2 columns on tablet (768-1024px)', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 900, height: 600 });

    const grid = page.locator('.activity-grid');

    // Check grid-template-columns
    const gridColumns = await grid.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 2 columns
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(2);
  });

  test('grid shows 1 column on mobile (<768px)', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const grid = page.locator('.activity-grid');

    // Check grid-template-columns
    const gridColumns = await grid.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 1 column
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('filter panel is sidebar on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    const pageLayout = page.locator('.page-layout');
    const filterPanel = page.locator('.filter-panel');

    // Check that layout uses flexbox row direction
    const flexDirection = await pageLayout.evaluate(
      el => window.getComputedStyle(el).flexDirection
    );

    expect(flexDirection).toBe('row');

    // Filter panel should have a fixed width
    const width = await filterPanel.evaluate(
      el => window.getComputedStyle(el).width
    );

    // Should be 280px as defined in CSS
    expect(width).toBe('280px');
  });

  test('filter panel is top section on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const pageLayout = page.locator('.page-layout');

    // Check that layout uses flexbox column direction
    const flexDirection = await pageLayout.evaluate(
      el => window.getComputedStyle(el).flexDirection
    );

    expect(flexDirection).toBe('column');

    // Filter panel should be full width
    const filterPanel = page.locator('.filter-panel');
    await expect(filterPanel).toBeVisible();
  });

  test('all UI elements accessible at mobile size', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check search is visible
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();

    // Check filters are visible
    const categoryFilter = page.locator('#category-filter');
    await expect(categoryFilter).toBeVisible();

    const levelFilter = page.locator('#level-filter');
    await expect(levelFilter).toBeVisible();

    // Check activity cards are visible
    const activityCard = page.locator('.activity-card').first();
    await expect(activityCard).toBeVisible();
  });

  test('all UI elements accessible at tablet size', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check all key elements are visible
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.locator('#category-filter')).toBeVisible();
    await expect(page.locator('#level-filter')).toBeVisible();
    await expect(page.locator('.activity-card').first()).toBeVisible();
  });

  test('all UI elements accessible at desktop size', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Check all key elements are visible
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.locator('#category-filter')).toBeVisible();
    await expect(page.locator('#level-filter')).toBeVisible();
    await expect(page.locator('.activity-card').first()).toBeVisible();
  });

  test('activity cards stack properly on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const cards = page.locator('.activity-card');
    const count = await cards.count();

    // Get positions of first two cards
    if (count >= 2) {
      const firstCardBox = await cards.nth(0).boundingBox();
      const secondCardBox = await cards.nth(1).boundingBox();

      // Second card should be below first card
      expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y! + firstCardBox?.height!);
    }
  });

  test('grid gap is consistent across breakpoints', async ({ page }) => {
    const grid = page.locator('.activity-grid');

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileGap = await grid.evaluate(
      el => window.getComputedStyle(el).gap
    );
    expect(mobileGap).toBeTruthy();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletGap = await grid.evaluate(
      el => window.getComputedStyle(el).gap
    );
    expect(tabletGap).toBeTruthy();

    // Test desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopGap = await grid.evaluate(
      el => window.getComputedStyle(el).gap
    );
    expect(desktopGap).toBeTruthy();

    // Gap should be consistent
    expect(mobileGap).toBe(tabletGap);
    expect(tabletGap).toBe(desktopGap);
  });

  test('page header text size scales appropriately', async ({ page }) => {
    const heading = page.locator('.page-header h1');

    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileFontSize = await heading.evaluate(
      el => window.getComputedStyle(el).fontSize
    );

    // Desktop size
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopFontSize = await heading.evaluate(
      el => window.getComputedStyle(el).fontSize
    );

    // Desktop should have larger font
    const mobileSize = parseFloat(mobileFontSize);
    const desktopSize = parseFloat(desktopFontSize);

    expect(desktopSize).toBeGreaterThan(mobileSize);
  });

  test('filter panel is sticky on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    const filterPanel = page.locator('.filter-panel');

    const position = await filterPanel.evaluate(
      el => window.getComputedStyle(el).position
    );

    expect(position).toBe('sticky');
  });

  test('filter panel is not sticky on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const filterPanel = page.locator('.filter-panel');

    const position = await filterPanel.evaluate(
      el => window.getComputedStyle(el).position
    );

    // Should be static or relative, not sticky
    expect(position).not.toBe('sticky');
  });

  test('activity cards are readable at all viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const card = page.locator('.activity-card').first();
      const title = card.locator('h3');
      const description = card.locator('.description');

      await expect(title).toBeVisible();
      await expect(description).toBeVisible();

      // Check text is not cut off
      const titleBox = await title.boundingBox();
      const cardBox = await card.boundingBox();

      if (titleBox && cardBox) {
        // Title should be within card bounds
        expect(titleBox.x).toBeGreaterThanOrEqual(cardBox.x);
        expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 2); // +2 for rounding
      }
    }
  });

  test('touch targets are appropriately sized on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check checkbox size
    const checkbox = page.locator('[data-filter="festival"]').first();
    const checkboxSize = await checkbox.evaluate(
      el => {
        const styles = window.getComputedStyle(el);
        return {
          width: parseFloat(styles.width),
          height: parseFloat(styles.height),
        };
      }
    );

    // Should be at least 18px (minimum for touch targets)
    expect(checkboxSize.width).toBeGreaterThanOrEqual(18);
    expect(checkboxSize.height).toBeGreaterThanOrEqual(18);

    // Check button size
    const clearButton = page.locator('#clear-filters');
    const buttonBox = await clearButton.boundingBox();

    // Button height should be appropriate for touch
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // 44px is recommended minimum
  });

  test('horizontal scrolling is not present', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('page container has appropriate padding at all sizes', async ({ page }) => {
    const container = page.locator('.page-container');

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const mobilePadding = await container.evaluate(
      el => window.getComputedStyle(el).padding
    );
    expect(mobilePadding).toBeTruthy();

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopPadding = await container.evaluate(
      el => window.getComputedStyle(el).padding
    );
    expect(desktopPadding).toBeTruthy();
  });

  test('filter controls are usable on touch devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const categoryFilter = page.locator('#category-filter');

    // Should be able to interact with filter
    await categoryFilter.tap();
    await categoryFilter.selectOption('game');

    // Verify filter was applied
    const value = await categoryFilter.inputValue();
    expect(value).toBe('game');
  });

  test('search input is appropriately sized on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const searchInput = page.locator('#search-input');
    const inputBox = await searchInput.boundingBox();

    // Should have adequate height for touch
    expect(inputBox?.height).toBeGreaterThanOrEqual(40);
  });

  test('viewport meta tag is present for responsive design', async ({ page }) => {
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    expect(viewportMeta).toBeTruthy();
    expect(viewportMeta).toContain('width=device-width');
  });
});
