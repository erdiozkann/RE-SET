import { test, expect, Page } from '@playwright/test';

// Force a fresh consent state: navigate, clear storage, reload. Doing it via
// addInitScript alone is racy in some environments because the banner's mount
// effect can run before the script injects on the very first navigation.
async function openWithFreshConsent(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.removeItem('cookieConsent');
      localStorage.removeItem('cookieConsentDate');
    } catch {
      /* no-op */
    }
  });
  await page.reload();
}

test.describe('Cookie banner', () => {
  test('appears with correct a11y attributes for first-time visitors', async ({ page }) => {
    await openWithFreshConsent(page);

    const dialog = page.getByRole('dialog', { name: /Çerez Kullanımı/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    await expect(page.getByRole('button', { name: 'Tümünü Kabul Et' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reddet' })).toBeVisible();
    // exact: true — Footer also renders a "Çerez Ayarları" button which substring-matches "Ayarlar".
    await expect(page.getByRole('button', { name: 'Ayarlar', exact: true })).toBeVisible();
  });

  test('"Tümünü Kabul Et" persists consent and dispatches event', async ({ page }) => {
    await openWithFreshConsent(page);
    await expect(page.getByRole('dialog', { name: /Çerez Kullanımı/i })).toBeVisible({
      timeout: 10_000,
    });

    const eventDetail = page.evaluate(
      () =>
        new Promise<unknown>((resolve) => {
          window.addEventListener(
            'cookie-consent-changed',
            (e) => resolve((e as CustomEvent).detail),
            { once: true },
          );
        }),
    );

    await page.getByRole('button', { name: 'Tümünü Kabul Et' }).click();

    expect(await eventDetail).toMatchObject({
      necessary: true,
      analytics: true,
      functional: true,
    });

    await expect(page.getByRole('dialog', { name: /Çerez Kullanımı/i })).toBeHidden();

    const stored = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toMatchObject({ analytics: true, functional: true });
  });

  test('Settings panel ESC key closes the panel only, not the consent dialog', async ({ page }) => {
    await openWithFreshConsent(page);
    await expect(page.getByRole('dialog', { name: /Çerez Kullanımı/i })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'Ayarlar', exact: true }).click();

    const settingsDialog = page.getByRole('dialog', { name: /Çerez Tercihleri/i });
    await expect(settingsDialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(settingsDialog).toBeHidden();
    await expect(page.getByRole('dialog', { name: /Çerez Kullanımı/i })).toBeVisible();
  });
});
