import { test, expect } from '@playwright/test';

test('Admin Login ve Danışan Paneli Erişimi', async ({ page }) => {
  // 1. Login sayfasına git
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  
  // 2. Login bilgilerini doldur
  await page.fill('input[type="email"]', 'info@re-set.com.tr');
  await page.fill('input[type="password"]', '123456');
  
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
