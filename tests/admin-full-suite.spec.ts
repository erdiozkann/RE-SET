import { test, expect } from '@playwright/test';

test('RE-SET Admin Panel Full Verifikasyon', async ({ page }) => {
  // 1. Admin Login
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'info@re-set.com.tr');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  
  // 2. Dashboard Görünürlüğünü Bekle
  await page.waitForURL('**/admin**');
  // 2. Dashboard Görünürlük (H1 veya ilk başlık)
  await expect(page.getByRole('heading', { name: 'Genel Bakış' }).first()).toBeVisible({ timeout: 15000 });

  // 3. CRM -> Danışanlar (URL Navigasyonu ile Garantile)
  await page.goto('/admin?tab=clients', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Danışan Listesi')).toBeVisible({ timeout: 15000 });

  // 4. Hizmetler
  await page.goto('/admin?tab=services', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Hizmet Listesi')).toBeVisible({ timeout: 15000 });

  // 5. Finans -> Muhasebe
  await page.goto('/admin?tab=accounting', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Muhasebe & Finansal Yönetim')).toBeVisible({ timeout: 15000 });

  // 6. İçerik Studio -> İçerik Yönetimi
  await page.goto('/admin?tab=content', { waitUntil: 'networkidle' });
  await expect(page.locator('text=Site İçerik Yönetimi')).toBeVisible({ timeout: 15000 });

  console.log('✅ RE-SET TÜM MODÜLLER BAŞARIYLA DOĞRULANDI.');
});
