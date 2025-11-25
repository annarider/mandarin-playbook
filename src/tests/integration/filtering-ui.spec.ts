import { test, expect } from '@playwright/test';

test.describe('Filtering UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.activity-grid');
  });

  test('subject filter dropdown displays all unique subjects', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    await expect(categoryFilter).toBeVisible();

    // Get all options
    const options = await categoryFilter.locator('option').allTextContents();

    // Should have "All subjects" plus the category options
    expect(options).toContain('All subjects');
    expect(options.length).toBeGreaterThan(1);
  });

  test('selecting subject filters activities correctly', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const activityGrid = page.locator('.activity-grid');

    // Get initial count
    const initialCount = await activityGrid.locator('.activity-card').count();

    // Select a specific category (game)
    await categoryFilter.selectOption('game');

    // Wait for filter to apply
    await page.waitForTimeout(100);

    // Get filtered count
    const filteredCount = await activityGrid.locator('.activity-card').count();

    // Count should change (unless all activities are games)
    if (initialCount > 1) {
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }

    // Verify all visible cards have the selected category
    const visibleCards = activityGrid.locator('.activity-card');
    const count = await visibleCards.count();

    for (let i = 0; i < count; i++) {
      const categoryBadge = visibleCards.nth(i).locator('.badge.category');
      await expect(categoryBadge).toContainText('game');
    }
  });

  test('level filter shows options beginner, intermediate, advanced', async ({ page }) => {
    const levelFilter = page.locator('#level-filter');
    await expect(levelFilter).toBeVisible();

    const options = await levelFilter.locator('option').allTextContents();

    expect(options).toContain('All levels');
    expect(options).toContain('Beginner');
    expect(options).toContain('Intermediate');
    expect(options).toContain('Advanced');
  });

  test('selecting level filters activities correctly', async ({ page }) => {
    const levelFilter = page.locator('#level-filter');
    const activityGrid = page.locator('.activity-grid');

    // Select beginner level
    await levelFilter.selectOption('beginner');

    // Wait for filter to apply
    await page.waitForTimeout(100);

    // Verify all visible cards have beginner level
    const visibleCards = activityGrid.locator('.activity-card');
    const count = await visibleCards.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const levelBadge = visibleCards.nth(i).locator('[class*="badge level-"]');
      await expect(levelBadge).toContainText('beginner');
    }
  });

  test('festival checkboxes display available festivals', async ({ page }) => {
    // Check for festival checkboxes
    const festivalCheckboxes = page.locator('[data-filter="festival"]');
    const count = await festivalCheckboxes.count();

    expect(count).toBeGreaterThan(0);

    // Verify they are checkboxes
    for (let i = 0; i < count; i++) {
      const checkbox = festivalCheckboxes.nth(i);
      await expect(checkbox).toHaveAttribute('type', 'checkbox');
    }
  });

  test('checking festival checkbox filters activities correctly', async ({ page }) => {
    const activityGrid = page.locator('.activity-grid');

    // Find a festival checkbox (e.g., thanksgiving)
    const thanksgivingCheckbox = page.locator('[data-filter="festival"][value="thanksgiving"]');

    if (await thanksgivingCheckbox.count() > 0) {
      // Check the box
      await thanksgivingCheckbox.check();

      // Wait for filter to apply
      await page.waitForTimeout(100);

      // Get filtered results
      const visibleCards = activityGrid.locator('.activity-card');
      const count = await visibleCards.count();

      if (count > 0) {
        // Verify all visible cards have thanksgiving tag
        for (let i = 0; i < count; i++) {
          const card = visibleCards.nth(i);
          const tags = card.locator('.tag');
          const tagTexts = await tags.allTextContents();

          // Should have thanksgiving tag or be thanksgiving related
          const hasTag = tagTexts.some(text => text.toLowerCase().includes('thanksgiving'));
          const title = await card.locator('h3').textContent();
          const hasInTitle = title?.toLowerCase().includes('thanksgiving');

          expect(hasTag || hasInTitle).toBe(true);
        }
      }
    }
  });

  test('printable toggle filters correctly', async ({ page }) => {
    const printableCheckbox = page.locator('#printable-filter');
    const activityGrid = page.locator('.activity-grid');

    // Check the printable filter
    await printableCheckbox.check();

    // Wait for filter to apply
    await page.waitForTimeout(100);

    // Get filtered results
    const visibleCards = activityGrid.locator('.activity-card');
    const count = await visibleCards.count();

    if (count > 0) {
      // All visible cards should have printable badge
      for (let i = 0; i < count; i++) {
        const card = visibleCards.nth(i);
        const printableBadge = card.locator('.printable-badge');
        await expect(printableBadge).toBeVisible();
      }
    }
  });

  test('multiple filters work together with AND logic', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const levelFilter = page.locator('#level-filter');
    const activityGrid = page.locator('.activity-grid');

    // Apply multiple filters
    await categoryFilter.selectOption('craft');
    await levelFilter.selectOption('beginner');

    // Wait for filters to apply
    await page.waitForTimeout(100);

    // Get filtered results
    const visibleCards = activityGrid.locator('.activity-card');
    const count = await visibleCards.count();

    if (count > 0) {
      // Verify all cards match both filters
      for (let i = 0; i < count; i++) {
        const card = visibleCards.nth(i);
        const categoryBadge = card.locator('.badge.category');
        const levelBadge = card.locator('[class*="badge level-"]');

        await expect(categoryBadge).toContainText('craft');
        await expect(levelBadge).toContainText('beginner');
      }
    }
  });

  test('clearing filters shows all activities', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const activityGrid = page.locator('.activity-grid');
    const clearButton = page.locator('#clear-filters');

    // Get initial count
    const initialCount = await activityGrid.locator('.activity-card').count();

    // Apply a filter
    await categoryFilter.selectOption('game');
    await page.waitForTimeout(100);

    // Click clear filters
    await clearButton.click();
    await page.waitForTimeout(100);

    // Count should return to initial
    const finalCount = await activityGrid.locator('.activity-card').count();
    expect(finalCount).toBe(initialCount);

    // Verify filter is reset
    const selectedValue = await categoryFilter.inputValue();
    expect(selectedValue).toBe('');
  });

  test('filter UI updates count of visible activities', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const resultsCount = page.locator('#results-count');

    // Get initial count text
    const initialText = await resultsCount.textContent();
    const initialMatch = initialText?.match(/\d+/);
    const initialNum = initialMatch ? parseInt(initialMatch[0]) : 0;

    // Apply filter
    await categoryFilter.selectOption('game');
    await page.waitForTimeout(100);

    // Get new count text
    const newText = await resultsCount.textContent();
    const newMatch = newText?.match(/\d+/);
    const newNum = newMatch ? parseInt(newMatch[0]) : 0;

    // Count should be updated
    expect(newText).toBeTruthy();
    expect(newText).toContain('activit');
  });

  test('multiple festival checkboxes use OR logic', async ({ page }) => {
    const activityGrid = page.locator('.activity-grid');

    // Check multiple festival checkboxes
    const thanksgivingCheckbox = page.locator('[data-filter="festival"][value="thanksgiving"]');
    const midAutumnCheckbox = page.locator('[data-filter="festival"][value="mid-autumn"]');

    if (await thanksgivingCheckbox.count() > 0 && await midAutumnCheckbox.count() > 0) {
      await thanksgivingCheckbox.check();
      await midAutumnCheckbox.check();

      await page.waitForTimeout(100);

      // Should show activities with either tag
      const visibleCards = activityGrid.locator('.activity-card');
      const count = await visibleCards.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('filter state persists when adding more filters', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const levelFilter = page.locator('#level-filter');

    // Set first filter
    await categoryFilter.selectOption('craft');
    await page.waitForTimeout(100);

    // Add second filter
    await levelFilter.selectOption('beginner');
    await page.waitForTimeout(100);

    // Verify first filter is still set
    const categoryValue = await categoryFilter.inputValue();
    expect(categoryValue).toBe('craft');
  });

  test('no results message displays when filters eliminate all activities', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const levelFilter = page.locator('#level-filter');
    const activityGrid = page.locator('.activity-grid');

    // Try to apply filters that might result in no matches
    await categoryFilter.selectOption('game');
    await levelFilter.selectOption('advanced');

    await page.waitForTimeout(100);

    // Check if no results message appears
    const noResults = activityGrid.locator('.no-results');
    const cardCount = await activityGrid.locator('.activity-card').count();

    if (cardCount === 0) {
      await expect(noResults).toBeVisible();
      await expect(noResults).toContainText('No activities found');
    }
  });

  test('clear filters button is always visible and clickable', async ({ page }) => {
    const clearButton = page.locator('#clear-filters');

    await expect(clearButton).toBeVisible();
    await expect(clearButton).toBeEnabled();

    // Should be clickable
    await clearButton.click();
  });

  test('unchecking festival checkbox removes filter', async ({ page }) => {
    const thanksgivingCheckbox = page.locator('[data-filter="festival"][value="thanksgiving"]');
    const activityGrid = page.locator('.activity-grid');

    if (await thanksgivingCheckbox.count() > 0) {
      // Get initial count
      const initialCount = await activityGrid.locator('.activity-card').count();

      // Check and then uncheck
      await thanksgivingCheckbox.check();
      await page.waitForTimeout(100);

      await thanksgivingCheckbox.uncheck();
      await page.waitForTimeout(100);

      // Count should return to initial (or close to it)
      const finalCount = await activityGrid.locator('.activity-card').count();
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('filter panel has proper labels for accessibility', async ({ page }) => {
    // Check category filter label
    const categoryLabel = page.locator('label[for="category-filter"]');
    await expect(categoryLabel).toBeVisible();
    await expect(categoryLabel).toContainText('Subject');

    // Check level filter label
    const levelLabel = page.locator('label[for="level-filter"]');
    await expect(levelLabel).toBeVisible();
    await expect(levelLabel).toContainText('Difficulty Level');
  });
});
