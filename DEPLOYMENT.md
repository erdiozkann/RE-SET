# 🚀 RE-SET Hostinger Deployment Guide

Bu kılavuz, RE-SET platformunun Hostinger üzerine sorunsuz bir şekilde kurulması için gerekli adımları içerir.

## 📦 1. Build İşlemi

Yerel terminalinizde projeyi derleyin:

```bash
npm run build
```

Bu işlem sonucunda projenin kök dizininde `HOSTINGER_UPLOAD` klasörü oluşacaktır.

## 📤 2. Dosyaları Yükleme

1. Hostinger **hPanel**'e giriş yapın.
2. **Dosya Yöneticisi**ne (File Manager) gidin.
3. `public_html` klasörüne girin.
4. Yerel bilgisayarınızdaki `HOSTINGER_UPLOAD` klasörünün **İÇİNDEKİ** tüm dosyaları `public_html` içine yükleyin.

## 🛣️ 3. SPA Routing (.htaccess)

React bir Single Page Application (SPA) olduğu için, sayfa yenilemelerinde 404 hatası almamak için `public_html` içinde `.htaccess` dosyası oluşturun ve aşağıdaki kodları yapıştırın:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🗄️ 4. Veritabanı Güncelleme (Supabase)

Admin panelinde blog oluşturma ve kategorilendirme özelliklerinin hatasız çalışması için Supabase dashboard'da şu adımları takip edin:

1. [Supabase Dashboard](https://supabase.com/dashboard)'a girin.
2. **SQL Editor** kısmına gidin.
3. Proje dizinindeki `fix_blog_posts_final.sql` dosyasının içeriğini kopyalayıp buraya yapıştırın ve **Run** düğmesine basın.

## 🔐 5. SSL ve HTTPS

Hostinger hPanel üzerinden siteniz için SSL sertifikasının aktif olduğundan emin olun. HTTPS yönlendirmesi için `.htaccess` dosyasına SSL zorlama kurallarını ekleyebilirsiniz.

---

**Son Kontrol Listesi:**
- [ ] Dosyalar `public_html` içinde mi?
- [ ] `.htaccess` dosyası SPA ayarlarıyla mevcut mu?
- [ ] `.env` ayarları (VITE_SUPABASE_URL vb.) build işleminde doğru çekildi mi?
- [ ] SQL migrasyonu çalıştırıldı mı?

🚀 **Siteniz Yayına Hazır!**
