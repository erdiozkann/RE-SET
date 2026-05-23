import { test, expect } from '@playwright/test';

const ROUTES: Array<{ path: string; titleMatch: RegExp }> = [
  { path: '/about', titleMatch: /Hakkımda|Şafak Özkan/ },
  { path: '/methods', titleMatch: /Demartini|Yöntemler/ },
  { path: '/blog', titleMatch: /Blog/ },
  { path: '/contact', titleMatch: /İletişim|Contact/ },
];

test.describe('Public route navigation', () => {
  for (const { path, titleMatch } of ROUTES) {
    test(`${path} loads, has main landmark, and a route-appropriate title`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(titleMatch);
      await expect(page.locator('main#main-content')).toBeVisible();
      // Prerendered HTML must include a route-specific canonical, not the default "/"
      const canonical = page.locator('link[rel="canonical"]').first();
      const href = await canonical.getAttribute('href');
      expect(href).toContain(path);
    });
  }
});
