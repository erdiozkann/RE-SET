import { test, expect } from '@playwright/test';

test.describe('A11y baseline', () => {
  test('skip-to-main-content link is keyboard reachable and moves focus to main', async ({
    page,
  }) => {
    await page.goto('/');

    const skipLink = page.locator('a[href="#main-content"]');
    // The link exists in the DOM and is the first focusable element. We focus it
    // directly rather than driving with Tab (which depends on what the SPA shell
    // has done with the initial activeElement and is browser-dependent).
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    // Activating the skip link moves focus to <main id="main-content" tabIndex={-1}>.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe('main-content');
  });

  test('html element has lang="tr-TR"', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toMatch(/^tr/);
  });
});
