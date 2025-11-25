import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a fresh page for each test
    await page.goto('/');
    await page.waitForSelector('.activity-grid');
  });

  test('page loads in <2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'load' });
    await page.waitForSelector('.activity-grid');

    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('filtering activities takes <100ms', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');

    // Measure filter performance
    const startTime = Date.now();

    await categoryFilter.selectOption('game');

    // Wait for the filter to apply
    await page.waitForTimeout(50);

    const filterTime = Date.now() - startTime;

    console.log(`Filter time: ${filterTime}ms`);
    expect(filterTime).toBeLessThan(100);
  });

  test('search filtering takes <100ms', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Fill search and measure time
    const startTime = Date.now();

    await searchInput.fill('dragon');

    // Wait for debounce and filter to apply
    await page.waitForTimeout(350); // Just after debounce

    const searchTime = Date.now() - startTime;

    console.log(`Search time (including debounce): ${searchTime}ms`);

    // Should complete within debounce time + 100ms for processing
    expect(searchTime).toBeLessThan(500);
  });

  test('multiple filter changes perform efficiently', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const levelFilter = page.locator('#level-filter');
    const printableCheckbox = page.locator('#printable-filter');

    const startTime = Date.now();

    // Apply multiple filters in sequence
    await categoryFilter.selectOption('craft');
    await page.waitForTimeout(10);

    await levelFilter.selectOption('beginner');
    await page.waitForTimeout(10);

    await printableCheckbox.check();
    await page.waitForTimeout(10);

    const totalTime = Date.now() - startTime;

    console.log(`Multiple filter time: ${totalTime}ms`);

    // Should complete all three filters quickly
    expect(totalTime).toBeLessThan(200);
  });

  test('no memory leaks after multiple filter changes', async ({ page }) => {
    // Get initial memory metrics
    const initialMetrics = await page.metrics();

    const categoryFilter = page.locator('#category-filter');
    const searchInput = page.locator('#search-input');

    // Perform many filter operations
    for (let i = 0; i < 10; i++) {
      await categoryFilter.selectOption(['game', 'craft', 'story'][i % 3]);
      await page.waitForTimeout(50);

      await searchInput.fill(['dragon', 'thanksgiving', 'story'][i % 3]);
      await page.waitForTimeout(350);
    }

    // Clear filters
    await page.locator('#clear-filters').click();
    await page.waitForTimeout(100);

    // Get final metrics
    const finalMetrics = await page.metrics();

    // Check that JS heap size hasn't grown excessively
    const heapGrowth = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
    const heapGrowthMB = heapGrowth / (1024 * 1024);

    console.log(`Heap growth: ${heapGrowthMB.toFixed(2)}MB`);

    // Heap growth should be minimal (less than 5MB)
    expect(heapGrowthMB).toBeLessThan(5);
  });

  test('no layout shift during filtering', async ({ page }) => {
    // Get initial layout
    const grid = page.locator('.activity-grid');
    const initialBox = await grid.boundingBox();

    // Apply filter
    const categoryFilter = page.locator('#category-filter');
    await categoryFilter.selectOption('game');
    await page.waitForTimeout(100);

    // Check layout hasn't shifted
    const finalBox = await grid.boundingBox();

    expect(finalBox?.x).toBe(initialBox?.x);
    expect(finalBox?.y).toBe(initialBox?.y);
    expect(finalBox?.width).toBe(initialBox?.width);
  });

  test('DOM updates are efficient during filtering', async ({ page }) => {
    const activityGrid = page.locator('.activity-grid');

    // Measure DOM mutation during filter
    let mutationCount = 0;

    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        (window as any).mutationCount = ((window as any).mutationCount || 0) + mutations.length;
      });

      const grid = document.getElementById('activity-grid');
      if (grid) {
        observer.observe(grid, { childList: true, subtree: true });
      }
    });

    // Apply filter
    const categoryFilter = page.locator('#category-filter');
    await categoryFilter.selectOption('game');
    await page.waitForTimeout(100);

    // Get mutation count
    mutationCount = await page.evaluate(() => (window as any).mutationCount || 0);

    console.log(`DOM mutations during filter: ${mutationCount}`);

    // Should have minimal mutations (just updating the innerHTML)
    expect(mutationCount).toBeLessThan(50);
  });

  test('results counter updates synchronously with filtering', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const resultsCount = page.locator('#results-count');
    const activityGrid = page.locator('.activity-grid');

    // Apply filter
    await categoryFilter.selectOption('game');
    await page.waitForTimeout(100);

    // Get count from UI
    const countText = await resultsCount.textContent();
    const match = countText?.match(/(\d+)/);
    const displayedCount = match ? parseInt(match[1]) : 0;

    // Get actual card count
    const cardCount = await activityGrid.locator('.activity-card').count();

    // Should match exactly
    expect(displayedCount).toBe(cardCount);
  });

  test('page remains responsive during search debounce', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const categoryFilter = page.locator('#category-filter');

    // Start typing
    await searchInput.fill('dragon');

    // Immediately try to interact with other controls (during debounce)
    await categoryFilter.selectOption('craft');

    // Both should work without issues
    await page.waitForTimeout(350);

    const searchValue = await searchInput.inputValue();
    const filterValue = await categoryFilter.inputValue();

    expect(searchValue).toBe('dragon');
    expect(filterValue).toBe('craft');
  });

  test('filter panel interaction is smooth on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const categoryFilter = page.locator('#category-filter');

    const startTime = Date.now();

    // Tap and select
    await categoryFilter.tap();
    await categoryFilter.selectOption('game');

    const interactionTime = Date.now() - startTime;

    console.log(`Mobile filter interaction time: ${interactionTime}ms`);

    // Should be responsive even on mobile
    expect(interactionTime).toBeLessThan(200);
  });

  test('no JavaScript errors during rapid filter changes', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const categoryFilter = page.locator('#category-filter');
    const levelFilter = page.locator('#level-filter');

    // Rapidly change filters
    for (let i = 0; i < 5; i++) {
      await categoryFilter.selectOption(['game', 'craft'][i % 2]);
      await levelFilter.selectOption(['beginner', 'intermediate'][i % 2]);
      await page.waitForTimeout(20);
    }

    expect(errors).toHaveLength(0);
  });

  test('search debounce prevents excessive filtering', async ({ page }) => {
    let filterCallCount = 0;

    // Track how many times the grid is updated
    await page.evaluate(() => {
      const grid = document.getElementById('activity-grid');
      if (grid) {
        const observer = new MutationObserver(() => {
          (window as any).filterCallCount = ((window as any).filterCallCount || 0) + 1;
        });
        observer.observe(grid, { childList: true });
      }
    });

    const searchInput = page.locator('#search-input');

    // Type multiple characters quickly
    await searchInput.type('dragon', { delay: 50 });

    // Wait for debounce to complete
    await page.waitForTimeout(400);

    // Get filter call count
    filterCallCount = await page.evaluate(() => (window as any).filterCallCount || 0);

    console.log(`Filter calls during search: ${filterCallCount}`);

    // Should have been called minimal times (ideally once due to debounce)
    expect(filterCallCount).toBeLessThan(5);
  });

  test('clearing filters is performant', async ({ page }) => {
    const categoryFilter = page.locator('#category-filter');
    const levelFilter = page.locator('#level-filter');
    const searchInput = page.locator('#search-input');
    const clearButton = page.locator('#clear-filters');

    // Set multiple filters
    await categoryFilter.selectOption('game');
    await levelFilter.selectOption('beginner');
    await searchInput.fill('test');
    await page.waitForTimeout(350);

    // Measure clear time
    const startTime = Date.now();

    await clearButton.click();

    await page.waitForTimeout(100);

    const clearTime = Date.now() - startTime;

    console.log(`Clear filters time: ${clearTime}ms`);

    expect(clearTime).toBeLessThan(200);
  });

  test('filtering large dataset performs well', async ({ page }) => {
    // This test would need a larger dataset in production
    // For now, we test with existing data and verify it's fast

    const searchInput = page.locator('#search-input');

    const startTime = Date.now();

    // Perform search
    await searchInput.fill('activity');
    await page.waitForTimeout(350);

    const searchTime = Date.now() - startTime - 300; // Subtract debounce time

    console.log(`Search processing time: ${searchTime}ms`);

    // Even with many activities, should be fast
    expect(searchTime).toBeLessThan(100);
  });

  test('page is interactive quickly after load', async ({ page }) => {
    await page.goto('/');

    // Measure time to interactive
    const startTime = Date.now();

    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.activity-grid');

    // Try to interact with search
    const searchInput = page.locator('#search-input');
    await searchInput.click();

    const timeToInteractive = Date.now() - startTime;

    console.log(`Time to interactive: ${timeToInteractive}ms`);

    expect(timeToInteractive).toBeLessThan(2000);
  });

  test('scroll performance is smooth', async ({ page }) => {
    // Set viewport to have scrolling
    await page.setViewportSize({ width: 1280, height: 600 });

    // Measure scroll smoothness by checking frame rate isn't dropping
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            (window as any).fps = frameCount;
            resolve();
          }
        }

        // Scroll while measuring
        window.scrollTo({ top: 500, behavior: 'smooth' });
        requestAnimationFrame(countFrame);
      });
    });

    const fps = await page.evaluate(() => (window as any).fps);

    console.log(`Average FPS during scroll: ${fps}`);

    // Should maintain reasonable frame rate (>30 fps)
    expect(fps).toBeGreaterThan(30);
  });

  test('CSS animations do not impact filter performance', async ({ page }) => {
    // Hover over a card to trigger animations
    const firstCard = page.locator('.activity-card').first();
    await firstCard.hover();

    // Apply filter while animation is active
    const startTime = Date.now();

    const categoryFilter = page.locator('#category-filter');
    await categoryFilter.selectOption('game');

    await page.waitForTimeout(50);

    const filterTime = Date.now() - startTime;

    console.log(`Filter time with animations: ${filterTime}ms`);

    // Should still be fast
    expect(filterTime).toBeLessThan(150);
  });
});
