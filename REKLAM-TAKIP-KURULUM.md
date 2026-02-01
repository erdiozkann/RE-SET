# 📊 REKLAM TAKIP SİSTEMİ - KURULUM KILAVUZU

## 🔧 1. SUPABASE SETUP (Bir kez yapılır)

### SQL Schema Deployment
1. **Supabase Dashboard'a git:** https://supabase.com/dashboard
2. **Projen seç** → RE-SET
3. **SQL Editor'a tıkla** (left sidebar)
4. **+ New Query** tıkla
5. Bu dosyayı aç: `supabase-ads-tracking.sql`
6. İçeriğini kopyala ve SQL Editor'a yapıştır
7. **RUN** tıkla

**Oluşturulan Tablolar:**
- `ad_accounts` - Reklam platformu hesapları
- `ad_campaigns` - Kampanya detayları
- `ad_metrics` - Günlük performans metrikleri
- `ad_conversions` - Dönüşüm verileri
- `ad_roi_summary` - Aylık ROI özeti

---

## 📱 2. REKLAM HESABI EKLEME

### Admin Panel'de Hesap Ekle
1. **Admin Panel'e giriş yap** → `/admin`
2. **Sol menüden "Reklam Takibi" tıkla**
3. **"Hesaplar" tab'ında + Hesap Ekle tıkla**
4. Formu doldur:
   - **Platform:** Google Ads / Meta / TikTok
   - **Hesap Adı:** Tanımlayıcı isim (örn: "Google Ads - Ana")
   - **Hesap ID:** API'den alınan account ID (opsiyonel)
   - **API Key:** Google/Meta API key (opsiyonel - şimdilik)
   - **Durum:** Aktif/İnaktif

5. **Kaydet** tıkla

### Örnek:
```
Platform: Google Ads
Hesap Adı: Google Ads - Danışmanlık Hizmetleri
Hesap ID: 1234567890
API Key: [API anahtarı]
Durum: ✓ Aktif
```

---

## 📈 3. KAMPANYAları GÖRÜNTÜLE

### Kampanya Bilgileri
- **"Kampanyalar" tab'ında** tüm aktif/geçmiş kampanyalar gösterilir
- Platform filtresi ile Google Ads, Meta, TikTok arasında geçiş yap
- **Sütunlar:**
  - Kampanya Adı
  - Durum (Aktif 🟢 / Duraklatıldı 🟡 / Bitti 🔴)
  - Bütçe
  - Harcanan Tutar
  - Tarih Aralığı

---

## 📊 4. METRİKLERİ TAKIP ET

### Performans Verileri
- **"Metrikler" tab'ında** günlük performans metrikleri gösterilir
- **Filtrele:** Belirli bir kampanya seçerek o kampanyanın verilerini göster

### Toplam Istatistikler:
- 📊 **Gösterim (Impressions)** - Kaç kez gösterildi
- 🖱️ **Tıklamalar** - Kaç kez tıklandı
- ✅ **Dönüşümler** - Kaç dönüşüm oldu
- 💰 **Harcanan** - Toplam maliyet
- 📈 **Ortalama CTR** - Tıklama oranı
- 💵 **Ortalama CPC** - Tıklama başına maliyet

### Günlük Detay Tablosu:
```
Tarih | Gösterim | Tıkla | CTR | Dönüşüm | Maliyet | CPC
...
```

---

## 💰 5. DÖNÜŞÜMLERI TAKIP ET

### Conversion Analytics
- **"Dönüşümler" tab'ında** tüm dönüşüm verileri gösterilir
- **Dönüşüm Tipleri:**
  - Purchase (Satın Alma)
  - Signup (Kayıt)
  - Booking (Rezervasyon)
  - Inquiry (Sorgu/İletişim)

### Veriler:
```
Kampanya | Dönüşüm Tipi | Sayı | Değer | CPA | Tarih
```

---

## 💹 6. ROI HESABINI GÖRÜNTÜLE

### Aylık ROI Özeti
- **"ROI" tab'ında** aylık kârlılık gösterilir
- **Formül:** `ROI % = (Gelir - Harcama) / Harcama × 100`

### Veriler:
```
Ay       | Toplam Harcama | Toplam Gelir | ROI %
2024-12  | ₺5,000         | ₺15,000      | 200%
2024-11  | ₺3,500         | ₺10,500      | 200%
```

---

## 🔄 7. VERİ GÜNCELLEME (API İntegrasyonu)

### Gelecekte: Otomatik Veri Senkronizasyonu
Google Ads, Meta ve TikTok API'lerinden otomatik veri çekme:

```typescript
// Örnek (gelecekte yapılacak)
const syncGoogleAds = async () => {
  const campaigns = await googleAdsApi.getCampaigns();
  const metrics = await googleAdsApi.getMetrics();
  // Supabase'e kaydedilecek
};
```

---

## 🛡️ 8. SEÇENEKLERİ

### Hesap Yönetimi
- ✏️ Düzenle
- 🗑️ Sil

### Türkçe Arayüz
- Platform: Google Ads, Meta (Facebook/Instagram), TikTok
- Durum: Aktif, Duraklatıldı, Bitti
- Otomatik tarih formatı: GG.AA.YYYY

---

## ✅ KONTROL LİSTESİ

- [ ] Supabase SQL schema çalıştırıldı
- [ ] Admin Panel'de login yapıldı
- [ ] Reklam Hesabı eklendi
- [ ] Kampanya Verisi Görüntülendi
- [ ] Metrikler Görüntülendi
- [ ] Dönüşümler Görüntülendi
- [ ] ROI Özeti Görüntülendi

---

## 🆘 SORUN GİDERME

### Hesap Eklenemedi
- Lütfen "Hesap Adı" alanını doldurduğunuz kontrol edin
- Supabase RLS policies'nin aktif olduğundan emin olun

### Veri Görüntülenmiyor
- Supabase'de `ad_*` tablolarının oluşturulduğundan emin olun
- Admin hesabın authenticated olduğundan emin olun
- Browser console'da hataları kontrol edin (F12)

### İlgili Dosyalar
- Frontend: `src/pages/admin/components/AdsTab.tsx`
- API: `src/lib/api.ts` (adAccountsApi, adCampaignsApi, adMetricsApi, adConversionsApi, adROISummaryApi)
- Types: `src/types/index.ts` (AdAccount, AdCampaign, AdMetrics, AdConversion, AdROISummary)
- Database: `supabase-ads-tracking.sql`

---

**Son Güncelleme:** 5 Aralık 2025
**Sistem:** React + Vite + Supabase + TypeScript
