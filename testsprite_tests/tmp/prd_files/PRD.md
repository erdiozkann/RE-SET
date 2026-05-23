# RE-SET Web Sitesi — Ürün Gereksinimleri Dokümanı (PRD)

## Genel Bakış
RE-SET, Demartini Metodu uygulayıcısı Şafak Özkan'ın kişisel koçluk ve danışmanlık web sitesidir. Site, potansiyel danışanların bilgi edinmesini, randevu almasını ve mevcut danışanların kendi panellerine erişmesini sağlar.

**URL:** https://re-set.com.tr
**Teknoloji:** React 19, TypeScript, Vite, Tailwind CSS, Supabase
**Dil:** Türkçe

---

## Kullanıcı Rolleri

### 1. Ziyaretçi (Giriş Yapmamış)
- Tüm herkese açık sayfalara erişebilir
- Randevu formu doldurabilir (onay bekler)
- İletişim formu gönderebilir
- Blog, podcast, YouTube içeriklerini görüntüleyebilir

### 2. Danışan (Giriş Yapmış)
- Client Panel'e erişebilir
- Randevularını görebilir
- Profil bilgilerini güncelleyebilir

### 3. Admin (Şafak Özkan)
- Tüm site içeriklerini yönetebilir
- Randevuları yönetebilir
- Blog, podcast, YouTube içeriği oluşturabilir/düzenleyebilir/silebilir
- Danışan hesaplarını yönetebilir
- Muhasebe işlemlerini yürütebilir

---

## Sayfalar ve Özellikler

### 1. Anasayfa (`/`)
- Hero bölümü (başlık, açıklama, randevu CTA butonu)
- Hizmetler özeti
- Hakkında kısa tanıtım
- Yorumlar/değerlendirmeler slider
- Öne çıkan blog yazıları

### 2. Hakkında (`/about`)
- Şafak Özkan'ın biyografisi ve sertifikaları
- Profil görseli

### 3. Yöntemler (`/methods`)
- Demartini Metodu ve diğer terapi yöntemleri listesi
- Her yöntemin detay açıklaması

### 4. Blog (`/blog`)
- Blog yazıları listeleme (başlık, özet, kategori, tarih, görsel)
- Kategori filtresi
- Öne çıkan yazılar bölümü
- Her yazıya tıklandığında detay sayfası açılmalı (`/blog/:id`)
- Detay sayfasında: başlık, görsel, içerik (HTML/Markdown), tarih, okuma süresi, kategori

### 5. Podcast (`/podcast`)
- Podcast bölümleri listesi (başlık, açıklama, tarih)
- Bölüme tıklandığında alt player'da seçilir
- Sticky audio player (sayfa altında sabit): oynat/durdur, ileri/geri 10sn, süre çubuğu
- Bölümler supabase'den çekilir (podcast_episodes tablosu)

### 6. YouTube (`/youtube`)
- YouTube videoları galerisi
- Her videonun thumbnail'i, başlık ve açıklaması
- Tıklandığında YouTube'a yönlendirir veya modal açar

### 7. Randevu (`/booking`)
- Ad Soyad, E-posta, Telefon alanları
- Hizmet seçimi (dropdown)
- Tarih ve saat seçimi
- Notlar alanı
- Form gönderimi admin panele düşer

### 8. İletişim (`/contact`)
- Ad, e-posta, telefon, mesaj alanları
- Form gönderimi admin panele düşer

### 9. Giriş (`/login`)
- E-posta ve şifre ile giriş
- Şifre unutma linki

### 10. Kayıt (`/register`)
- Ad soyad, e-posta, şifre, şifre onayı
- Kayıt sonrası admin onayı gerekir

### 11. Şifre Sıfırlama (`/reset-password`)
- E-posta ile şifre sıfırlama

### 12. Danışan Paneli (`/client-panel`) — Korumalı
- Yaklaşan randevular listesi
- Profil bilgileri düzenleme (ad, telefon)
- İlerleme grafiği

### 13. Admin Paneli (`/admin`) — Admin Korumalı
#### Sekmeler:
- **Dashboard**: Özet istatistikler
- **Randevular**: Randevu onaylama/reddetme/düzenleme
- **Blog**: Blog yazısı oluşturma/düzenleme/silme
- **Podcast**: Podcast bölümü yönetimi (ses dosyası + metadata)
- **YouTube**: YouTube video yönetimi
- **Danışanlar**: Danışan hesap yönetimi
- **Mesajlar**: İletişim formu mesajları
- **İçerik**: Hero, Hakkında, İletişim bilgileri düzenleme
- **Yöntemler**: Terapi yöntemleri yönetimi
- **Yorumlar**: Kullanıcı yorumları onaylama/silme
- **Muhasebe**: Fatura, ödeme yönetimi

---

## Teknik Gereksinimler

### Kimlik Doğrulama
- Supabase Auth kullanılır
- Admin rolü: `app_metadata.role = 'ADMIN'` veya `user_metadata.role = 'ADMIN'`
- Geçersiz giriş bilgileri ile admin paneline erişilemez

### Veri
- Supabase PostgreSQL veritabanı
- RLS (Row Level Security) politikaları aktif
- Herkese açık tablolar (public read): blog_posts, podcast_episodes, methods, hero_contents, about_contents, services, certificates, reviews (approved), contact_info, profile_images, youtube_videos (is_published=true)

### Çerez Yönetimi
- Çerez banner'ı gösterilir
- "Kabul Et" tıklandığında banner kaybolur ve session boyunca görünmez
- "Reddet" tıklandığında da banner kaybolur

### SEO
- Her sayfada uygun meta title ve description
- Schema.org JSON-LD yapılandırılmış veri (Blog, Person, etc.)

### Dil
- Site tamamen Türkçe
- Dil değiştirici yok (sadece Türkçe)

---

## Kritik Kullanıcı Senaryoları (Test Edilmesi Gereken)

### TC001: Geçerli bilgilerle giriş → Client Panel'e yönlendirilir
### TC002: Geçersiz bilgilerle giriş → Hata mesajı gösterilir
### TC003: Kayıt formu başarıyla gönderilir
### TC004: Zayıf şifre ile kayıt → Doğrulama hatası
### TC005: Anasayfa header navigasyonundan Randevu sayfasına gidiş → Randevu formu görünür
### TC006: Anasayfa randevu CTA butonu → Randevu sayfasına gider
### TC007: Randevu formu başarıyla gönderilir → Onay mesajı
### TC008: Eksik iletişim bilgisi ile randevu → Hata mesajı
### TC009: Tarih seçilmeden randevu → Hata mesajı
### TC010: Saat seçilmeden randevu → Hata mesajı
### TC011: Admin girişi → Dashboard görünür
### TC012: Admin sekmeleri arasında geçiş → Her sekmenin içeriği görünür
### TC013: Admin yeni blog yazısı oluşturur → Blog listesinde görünür
### TC014: Admin oluşturduğu blog yazısını kaydeder → Listede görünür
### TC015: Geçersiz giriş ile admin paneline erişim engellenir
### TC016: Danışan paneli: yaklaşan randevular görünür (giriş yapılmış)
### TC017: Profil düzenleme ve kaydetme (giriş yapılmış)
### TC018: Geçersiz giriş ile danışan paneline erişim engellenir
### TC019: Blog listesi açılır → Yazılar görünür
### TC020: Blog yazısına tıklanır → Detay sayfası açılır (tam içerik görünür)
### TC021: Silinmiş/olmayan blog yazısı URL'si → Hata/404 durumu
### TC022: İletişim formu başarıyla gönderilir
### TC023: E-posta alanı olmadan iletişim formu → Doğrulama hatası
### TC024: Çerez banner kabul → Banner kaybolur, session boyunca görünmez
### TC025: Çerez banner reddet → Banner kaybolur
### TC026: Hakkında sayfası → Biyografi ve sertifikalar görünür
### TC027: Yöntemler sayfası → Terapi yöntemleri listesi görünür
### TC028: Bir yöntem öğesine tıklanır → Detaylar görünür
### TC029: Podcast sayfası → Bölümler listelenir
### TC030: Podcast bölümüne tıklanır → Audio player aktif olur, oynatılabilir
