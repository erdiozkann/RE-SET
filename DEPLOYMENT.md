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

## 🛣️ 3. SPA Routing + Güvenlik + Sıkıştırma (.htaccess)

**ELLE `.htaccess` YAZMAYIN.** `HOSTINGER_UPLOAD/` içindeki hazır `.htaccess`
dosyası zaten hepsini içeriyor:
- SPA fallback (404 önleme)
- HTTPS zorlama + `/methods → /demartini-yontemi` 301
- Güvenlik başlıkları (HSTS, CSP, X-Frame, nosniff, Referrer/Permissions-Policy, COOP)
- gzip + brotli sıkıştırma + immutable asset cache

Sadece 2. adımdaki toplu yüklemeyle `.htaccess` de `public_html`'e gitsin.
Gizli dosya olduğu için File Manager'da "Show hidden files (dotfiles)"
seçeneğini açmayı unutmayın; yoksa `.htaccess` yüklenmez.

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
