import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    const heading = await page.locator('h1');
    await expect(heading).toHaveText('Mandarin Homeschool Activities');
  });

  test('should display all 3 sample activities', async ({ page }) => {
    await page.goto('/');
    const activityLinks = await page.locator('ul li a');
    const count = await activityLinks.count();
    expect(count).toBe(3);
  });

  test('should display activity titles as clickable links', async ({ page }) => {
    await page.goto('/');

    // Check for Thanksgiving Gratitude Circle
    const thanksgivingLink = await page.locator('a:has-text("Thanksgiving Gratitude Circle")');
    await expect(thanksgivingLink).toBeVisible();
    await expect(thanksgivingLink).toHaveAttribute('href', '/activities/thanksgiving-gratitude');

    // Check for Number Jump Game
    const countingLink = await page.locator('a:has-text("Number Jump Game")');
    await expect(countingLink).toBeVisible();
    await expect(countingLink).toHaveAttribute('href', '/activities/counting-game');

    // Check for Mid-Autumn Festival Story Time
    const midAutumnLink = await page.locator('a:has-text("Mid-Autumn Festival Story Time")');
    await expect(midAutumnLink).toBeVisible();
    await expect(midAutumnLink).toHaveAttribute('href', '/activities/mid-autumn-story');
  });

  test('should navigate to activity detail page when clicking a link', async ({ page }) => {
    await page.goto('/');

    // Click on the first activity
    await page.click('a:has-text("Thanksgiving Gratitude Circle")');

    // Wait for navigation
    await page.waitForURL('/activities/thanksgiving-gratitude');

    // Verify we're on the detail page (use more specific selector)
    const heading = page.locator('.activity-header h1').first();
    await expect(heading).toHaveText('Thanksgiving Gratitude Circle');
  });

  test('should have no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    expect(consoleErrors).toHaveLength(0);
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Mandarin Homeschool Activities');
  });

  test('should have all links with valid href attributes', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('ul li a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\/activities\//);
    }
  });
});
