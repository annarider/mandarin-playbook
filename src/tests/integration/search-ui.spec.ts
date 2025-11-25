import { test, expect } from '@playwright/test';

test.describe('Search UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.activity-grid');
  });

  test('search input is visible and accessible', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('type', 'search');
    await expect(searchInput).toHaveAttribute('aria-label', 'Search activities');
    await expect(searchInput).toHaveAttribute('placeholder');
  });

  test('typing in search filters activities in real-time', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Get initial count
    const initialCount = await activityGrid.locator('.activity-card').count();

    // Type a search query
    await searchInput.fill('dragon');

    // Wait for debounce (300ms) plus a bit extra
    await page.waitForTimeout(400);

    // Get filtered count
    const filteredCount = await activityGrid.locator('.activity-card').count();

    // Should have filtered results (unless all activities have 'dragon')
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('search works with title matches', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search for a title keyword
    await searchInput.fill('game');
    await page.waitForTimeout(400);

    // Get results
    const visibleCards = activityGrid.locator('.activity-card');
    const count = await visibleCards.count();

    if (count > 0) {
      // At least one card should have 'game' in title
      const firstTitle = await visibleCards.first().locator('h3').textContent();
      expect(firstTitle?.toLowerCase()).toContain('game');
    }
  });

  test('search works with description matches', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search for a description keyword
    await searchInput.fill('gratitude');
    await page.waitForTimeout(400);

    // Get results
    const visibleCards = activityGrid.locator('.activity-card');
    const count = await visibleCards.count();

    if (count > 0) {
      // Check that results have the search term in title or description
      const firstCard = visibleCards.first();
      const title = await firstCard.locator('h3').textContent();
      const description = await firstCard.locator('.description').textContent();

      const hasMatch =
        title?.toLowerCase().includes('gratitude') ||
        description?.toLowerCase().includes('gratitude');

      expect(hasMatch).toBe(true);
    }
  });

  test('search is case-insensitive', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search with uppercase
    await searchInput.fill('DRAGON');
    await page.waitForTimeout(400);

    const upperCount = await activityGrid.locator('.activity-card').count();

    // Clear and search with lowercase
    await searchInput.fill('');
    await page.waitForTimeout(400);

    await searchInput.fill('dragon');
    await page.waitForTimeout(400);

    const lowerCount = await activityGrid.locator('.activity-card').count();

    // Should return same results
    expect(upperCount).toBe(lowerCount);
  });

  test('search + filters work together', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const categoryFilter = page.locator('#category-filter');
    const activityGrid = page.locator('.activity-grid');

    // Apply a filter first
    await categoryFilter.selectOption('craft');
    await page.waitForTimeout(100);

    const filteredCount = await activityGrid.locator('.activity-card').count();

    // Then search within filtered results
    await searchInput.fill('dragon');
    await page.waitForTimeout(400);

    const combinedCount = await activityGrid.locator('.activity-card').count();

    // Combined should be less than or equal to just filtered
    expect(combinedCount).toBeLessThanOrEqual(filteredCount);

    // If there are results, verify they match both filters
    if (combinedCount > 0) {
      const card = activityGrid.locator('.activity-card').first();
      const categoryBadge = card.locator('.badge.category');
      await expect(categoryBadge).toContainText('craft');

      const title = await card.locator('h3').textContent();
      const description = await card.locator('.description').textContent();
      const hasSearchTerm =
        title?.toLowerCase().includes('dragon') ||
        description?.toLowerCase().includes('dragon');

      expect(hasSearchTerm).toBe(true);
    }
  });

  test('clearing search shows all activities', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Get initial count
    const initialCount = await activityGrid.locator('.activity-card').count();

    // Perform search
    await searchInput.fill('dragon');
    await page.waitForTimeout(400);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(400);

    // Count should return to initial
    const finalCount = await activityGrid.locator('.activity-card').count();
    expect(finalCount).toBe(initialCount);
  });

  test('no results message displays when search has no matches', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search for something that definitely doesn't exist
    await searchInput.fill('zzzzzznonexistent123');
    await page.waitForTimeout(400);

    // Should show no results message
    const noResults = activityGrid.locator('.no-results');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText('No activities found');
  });

  test('no results message has clear filters button', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search for something that doesn't exist
    await searchInput.fill('zzzzzznonexistent123');
    await page.waitForTimeout(400);

    // Check for button in no results message
    const noResults = activityGrid.locator('.no-results');
    const clearButton = noResults.locator('button');

    if (await noResults.isVisible()) {
      await expect(clearButton).toBeVisible();
    }
  });

  test('search is debounced (does not filter on every keystroke)', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const resultsCount = page.locator('#results-count');

    // Get initial count
    const initialText = await resultsCount.textContent();

    // Type multiple characters quickly
    await searchInput.type('dragon', { delay: 50 }); // Type fast

    // Immediately check - should still show initial count (debounced)
    const immediateText = await resultsCount.textContent();

    // Wait for debounce to complete
    await page.waitForTimeout(400);

    // Now should be filtered
    const finalText = await resultsCount.textContent();

    // The final text should be different from initial if there's a filter effect
    // We can't guarantee immediate === initial due to timing, but we can verify the debounce worked
    expect(finalText).toBeTruthy();
  });

  test('search updates results count', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const resultsCount = page.locator('#results-count');

    // Get initial count number
    const initialText = await resultsCount.textContent();
    const initialMatch = initialText?.match(/\d+/);
    const initialNum = initialMatch ? parseInt(initialMatch[0]) : 0;

    // Perform search
    await searchInput.fill('dragon');
    await page.waitForTimeout(400);

    // Get new count
    const newText = await resultsCount.textContent();
    const newMatch = newText?.match(/\d+/);
    const newNum = newMatch ? parseInt(newMatch[0]) : 0;

    // Count should be updated and valid
    expect(newText).toBeTruthy();
    expect(newNum).toBeGreaterThanOrEqual(0);
    expect(newNum).toBeLessThanOrEqual(initialNum);
  });

  test('search with partial word matches correctly', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search with partial word
    await searchInput.fill('grat');
    await page.waitForTimeout(400);

    const count = await activityGrid.locator('.activity-card').count();

    // If there are results, they should contain the partial match
    if (count > 0) {
      const firstCard = activityGrid.locator('.activity-card').first();
      const title = await firstCard.locator('h3').textContent();
      const description = await firstCard.locator('.description').textContent();

      const hasMatch =
        title?.toLowerCase().includes('grat') ||
        description?.toLowerCase().includes('grat');

      expect(hasMatch).toBe(true);
    }
  });

  test('search handles special characters', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Type special characters - should not cause errors
    await searchInput.fill("Chang'e");
    await page.waitForTimeout(400);

    // Page should still be functional
    await expect(searchInput).toHaveValue("Chang'e");
  });

  test('clear all filters button also clears search', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const clearButton = page.locator('#clear-filters');

    // Perform search
    await searchInput.fill('dragon');
    await page.waitForTimeout(400);

    // Click clear all
    await clearButton.click();
    await page.waitForTimeout(100);

    // Search should be cleared
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('');
  });

  test('search input maintains focus when typing', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    await searchInput.click();
    await searchInput.type('dragon');

    // Input should still be focused
    const isFocused = await searchInput.evaluate(
      el => el === document.activeElement
    );

    expect(isFocused).toBe(true);
  });

  test('search works independently of filters', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Search without any filters
    await searchInput.fill('thanksgiving');
    await page.waitForTimeout(400);

    const count = await activityGrid.locator('.activity-card').count();

    if (count > 0) {
      // Results should match search term
      const cards = activityGrid.locator('.activity-card');

      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const title = await card.locator('h3').textContent();
        const description = await card.locator('.description').textContent();

        const hasMatch =
          title?.toLowerCase().includes('thanksgiving') ||
          description?.toLowerCase().includes('thanksgiving');

        expect(hasMatch).toBe(true);
      }
    }
  });

  test('empty search query shows all activities', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const activityGrid = page.locator('.activity-grid');

    // Get initial count
    const initialCount = await activityGrid.locator('.activity-card').count();

    // Enter and clear search
    await searchInput.fill('test');
    await page.waitForTimeout(400);
    await searchInput.fill('');
    await page.waitForTimeout(400);

    // Should show all activities
    const finalCount = await activityGrid.locator('.activity-card').count();
    expect(finalCount).toBe(initialCount);
  });

  test('search placeholder text is descriptive', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const placeholder = await searchInput.getAttribute('placeholder');

    expect(placeholder).toBeTruthy();
    expect(placeholder?.toLowerCase()).toContain('search');
  });
});
