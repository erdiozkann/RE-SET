import { test, expect } from '@playwright/test';

// Kimlik bilgileri asla repoya yazılmaz — lokal çalıştırma:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx playwright test tests/admin-login.spec.ts
test('Admin Login ve Danışan Paneli Erişimi', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  test.skip(!email || !password, 'ADMIN_EMAIL ve ADMIN_PASSWORD env değişkenleri gerekli');

  // 1. Login sayfasına git
  await page.goto('/login', { waitUntil: 'networkidle' });

  // 2. Login bilgilerini doldur
  await page.fill('input[type="email"]', email!);
  await page.fill('input[type="password"]', password!);
  
  // 3. Giriş yap butonuna tıkla
  await page.click('button[type="submit"]');
  
  // 4. Admin sayfasına yönlendirildiğimizi doğrula
  await page.waitForURL('**/admin**');
  expect(page.url()).toContain('/admin');
  
  // 5. "Danışanlar" sekmesinin göründüğünü kontrol et
  await page.waitForSelector('text=Danışanlar');
  const clientTab = page.locator('text=Danışanlar');
  await expect(clientTab).toBeVisible();
  
  // 6. Danışanlar sekmesine tıkla
  await clientTab.click();
  
  // 7. Danışan Listesi başlığını doğrula
  await expect(page.locator('text=Danışan Listesi')).toBeVisible();
  
  console.log('✅ TEST BAŞARILI: Admin Login ve Danışan Paneli Doğrulandı.');
});
