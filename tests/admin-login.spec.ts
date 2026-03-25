import { test, expect } from '@playwright/test';

test('Admin Login ve Danışan Paneli Erişimi', async ({ page }) => {
  // 1. Login sayfasına git
  await page.goto('http://localhost:5001/login', { waitUntil: 'networkidle' });
  
  // 2. Login bilgilerini doldur
  await page.fill('input[type="email"]', 'info@re-set.com.tr');
  await page.fill('input[type="password"]', '123456');
  
  // 3. Giriş yap butonuna tıkla
  await page.click('button[type="submit"]');

  // 4. Admin sayfasına yönlenmeyi bekle
  await page.waitForTimeout(5000); // UI animasyonlarını bekle
  await expect(page).toHaveURL(/admin/);

  // 5. Admin Dashboard (Genel Bakış) başlığını doğrula
  const header = page.locator('h1:has-text("Genel Bakış")');
  await expect(header).toBeVisible();

  // 6. Danışanlar (Clients) sekmesine geç
  await page.click('button:has-text("Danışanlar")');
  await expect(page.locator('text=Danışan Listesi')).toBeVisible();

  console.log('✅ TEST BAŞARILI: Admin Login ve Danışan Paneli Doğrulandı.');
});
