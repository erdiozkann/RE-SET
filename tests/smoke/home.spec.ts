import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders with correct title and key landmarks', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/RE-SET.*Şafak Özkan/);

    // Skip-to-main-content link must exist (a11y baseline)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    // Main landmark
    await expect(page.locator('main#main-content')).toBeVisible();

    // Footer should be present
    await expect(page.locator('footer')).toBeVisible();
  });

  test('unknown route renders without breaking the SPA', async ({ page }) => {
    const response = await page.goto('/this-route-definitely-does-not-exist');
    // SPA: status comes from index.html (200), the React router renders NotFound.
    // NotFound is mounted *outside* the Layout, so we check for any rendered content
    // rather than the #main-content landmark.
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
