import { test, expect } from '@playwright/test';

// Kimlik bilgileri asla repoya yazılmaz — lokal çalıştırma:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx playwright test tests/admin-full-suite.spec.ts
test('RE-SET Admin Panel Full Verifikasyon', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  test.skip(!email || !password, 'ADMIN_EMAIL ve ADMIN_PASSWORD env değişkenleri gerekli');

  // 1. Admin Login
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email!);
  await page.fill('input[type="password"]', password!);
  await page.click('button[type="submit"]');
  
  // 2. Dashboard Görünürlüğünü Bekle
  await page.waitForURL('**/admin**');
  // 2. Dashboard Görünürlük (H1 veya ilk başlık)
  await expect(page.getByRole('heading', { name: 'Genel Bakış' }).first()).toBeVisible({ timeout: 15000 });

  // 3. CRM -> Danışanlar (URL Navigasyonu ile Garantile)
  await page.goto('/admin?tab=clients', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Danışanlar' })).toBeVisible({ timeout: 15000 });

  // 4. Hizmetler
  await page.goto('/admin?tab=services', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Hizmetler' })).toBeVisible({ timeout: 15000 });

  // 5. Finans -> Muhasebe
  await page.goto('/admin?tab=accounting', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Muhasebe & Cari' })).toBeVisible({ timeout: 15000 });

  // 6. İçerik Studio -> İçerik Yönetimi
  await page.goto('/admin?tab=content', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Genel İçerik')).toBeVisible({ timeout: 15000 });

  console.log('✅ RE-SET TÜM MODÜLLER BAŞARIYLA DOĞRULANDI.');
});
