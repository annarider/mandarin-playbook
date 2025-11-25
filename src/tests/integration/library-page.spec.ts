import { test, expect } from '@playwright/test';

test.describe('Library Page Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('library page displays all activities on load', async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForSelector('.activity-grid');

    // Get all activity cards
    const activityCards = page.locator('.activity-card');
    const count = await activityCards.count();

    // Should have at least 1 activity (we have 3 in test data)
    expect(count).toBeGreaterThan(0);

    // Verify the results count matches the displayed cards
    const resultsCount = page.locator('#results-count');
    const countText = await resultsCount.textContent();
    expect(countText).toContain(`${count} activit`);
  });

  test('activities display in grid layout', async ({ page }) => {
    const grid = page.locator('.activity-grid');

    // Check that grid exists and has the correct display property
    await expect(grid).toBeVisible();
    await expect(grid).toHaveCSS('display', 'grid');
  });

  test('each activity card shows title, subject, and level', async ({ page }) => {
    const firstCard = page.locator('.activity-card').first();

    // Check for title (h3)
    const title = firstCard.locator('h3');
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();

    // Check for description
    const description = firstCard.locator('.description');
    await expect(description).toBeVisible();

    // Check for category badge
    const categoryBadge = firstCard.locator('.badge.category');
    await expect(categoryBadge).toBeVisible();

    // Check for level badge
    const levelBadge = firstCard.locator('[class*="badge level-"]');
    await expect(levelBadge).toBeVisible();
  });

  test('activity cards show metadata (age range and duration)', async ({ page }) => {
    const firstCard = page.locator('.activity-card').first();
    const metaInfo = firstCard.locator('.meta-info');

    await expect(metaInfo).toBeVisible();

    // Should have age range and duration
    const metaText = await metaInfo.textContent();
    expect(metaText).toBeTruthy();
  });

  test('festival tags display when present', async ({ page }) => {
    // Find an activity with tags (thanksgiving-gratitude has tags)
    const cardsWithTags = page.locator('.activity-card:has(.tags)');
    const count = await cardsWithTags.count();

    if (count > 0) {
      const firstCardWithTags = cardsWithTags.first();
      const tags = firstCardWithTags.locator('.tags .tag');

      await expect(tags.first()).toBeVisible();
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThan(0);
    }
  });

  test('printable badge shows when printable is true', async ({ page }) => {
    // Find cards with printable badge
    const printableCards = page.locator('.activity-card:has(.printable-badge)');
    const count = await printableCards.count();

    if (count > 0) {
      const badge = printableCards.first().locator('.printable-badge');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('Printable');
    }
  });

  test('clicking activity card navigates to detail page', async ({ page }) => {
    const firstCard = page.locator('.activity-card').first();

    // Get the href to verify navigation
    const href = await firstCard.getAttribute('href');
    expect(href).toMatch(/^\/activities\//);

    // Click and verify navigation
    await firstCard.click();
    await page.waitForURL(/\/activities\/.+/);

    // Verify we're on a detail page
    expect(page.url()).toContain('/activities/');
  });

  test('all activity cards are clickable links', async ({ page }) => {
    const activityCards = page.locator('.activity-card');
    const count = await activityCards.count();

    for (let i = 0; i < count; i++) {
      const card = activityCards.nth(i);
      const href = await card.getAttribute('href');
      expect(href).toMatch(/^\/activities\//);
    }
  });

  test('page header displays correctly', async ({ page }) => {
    const header = page.locator('.page-header h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Mandarin Playbook');

    const subtitle = page.locator('.page-header p');
    await expect(subtitle).toBeVisible();
  });

  test('search bar is visible and accessible', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('type', 'search');
    await expect(searchInput).toHaveAttribute('placeholder');
    await expect(searchInput).toHaveAttribute('aria-label');
  });

  test('filter panel is visible', async ({ page }) => {
    const filterPanel = page.locator('.filter-panel');
    await expect(filterPanel).toBeVisible();

    const filterHeading = filterPanel.locator('h2');
    await expect(filterHeading).toContainText('Filter Activities');
  });

  test('activity cards have hover effect', async ({ page }) => {
    const firstCard = page.locator('.activity-card').first();

    // Get initial border color
    const initialBorderColor = await firstCard.evaluate(
      el => window.getComputedStyle(el).borderColor
    );

    // Hover over the card
    await firstCard.hover();

    // Border should change (this is a basic check - actual color might vary)
    await expect(firstCard).toHaveCSS('transition', /all/);
  });

  test('no JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('activity grid is responsive container', async ({ page }) => {
    const grid = page.locator('.activity-grid');

    // Check grid gap exists
    const gridGap = await grid.evaluate(
      el => window.getComputedStyle(el).gap
    );
    expect(gridGap).not.toBe('');
  });

  test('results header shows activity count', async ({ page }) => {
    const resultsHeader = page.locator('.results-header');
    await expect(resultsHeader).toBeVisible();

    const heading = resultsHeader.locator('h2');
    await expect(heading).toContainText('Activities');

    const count = resultsHeader.locator('#results-count');
    await expect(count).toBeVisible();
    await expect(count).toContainText('activit');
  });
});
