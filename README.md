# RE-SET — Şafak Özkan | Demartini Yöntemi (Metodu) Türkiye

Şafak Özkan'ın Demartini Yöntemi danışmanlığı için **halka açık web sitesi + yönetim paneli**.
Canlı: **https://re-set.com.tr** (Hostinger). Tek dilli (Türkçe).

> Güncel çalışma durumu ve yol haritası için **[STATUS.md](./STATUS.md)** kanoniktir —
> oturuma başlarken onu oku.

## Teknoloji
- **Frontend:** React 19 + TypeScript + Vite 7, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage), RLS ile korumalı
- **Yönlendirme:** react-router-dom 7, route bazlı kod bölme (`React.lazy`)
- **SEO/GEO:** `vite-prerender-plugin` ile route bazlı statik HTML (H1 + entity + FAQ +
  FAQPage JSON-LD), schema.org @graph, `robots.txt` (AI botları dahil), `sitemap.xml`,
  `llms.txt` / `llms-full.txt`
- **Diğer:** framer-motion, DOMPurify, Playwright (e2e/smoke), GA4 + Microsoft Clarity
  (Consent Mode v2, default-denied)

## Yapı
```
src/
  pages/            # home, about, demartini-yontemi (methods), blog, podcast, youtube,
                    # booking, contact, login/register, client-panel, admin/*, legal (kvkk/privacy/…)
  components/       # Layout, SEO, base/, feature/ (Header, Footer, CookieBanner, ReviewsSlider)
  contexts/         # AuthContext (Supabase Auth)
  lib/              # api/* (Supabase veri katmanı), supabase.ts, analytics, clarity
  prerender.tsx     # route bazlı statik HTML üretimi (crawler + AI botları için)
scripts/            # generate-sitemap.mjs, generate-llms-full.mjs, og-card.html
_sql_migrations/    # RLS ve şema SQL'leri (2026-07-03_* = güncel güvenlik düzeltmeleri)
```

## Geliştirme
```bash
npm install
cp .env.example .env      # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY doldur
npm run dev               # http://localhost:3000
npm run build             # vite build + sitemap + llms → HOSTINGER_UPLOAD/
npm run test:smoke        # Playwright smoke testleri
```

### Ortam değişkenleri
| Değişken | Açıklama |
|----------|----------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Supabase bağlantısı (anon key public'tir) |
| `VITE_SITE_URL` | Kanonik site kökü (varsayılan https://re-set.com.tr) |
| `VITE_GA_ID` / `VITE_CLARITY_ID` | Boşsa analytics yüklenmez (no-op) |

Sırlar **asla** repoya girmez (`.env`, `.mcp.json` gitignore'da). Yönetim/DB işlemleri
için Supabase Personal Access Token'ı yalnızca yerelde, dosyada tut.

## Güvenlik & Yetki
- Auth: Supabase Auth (e-posta + parola). Admin belirleme **app_metadata + `admin_emails`
  tablosu** ile (`is_admin()`); `user_metadata` **yetki kaynağı değildir**.
- Yeni admin eklemek için ilgili e-postayı `admin_emails` tablosuna ekle.
- Tüm hassas tablolar RLS ile korunur; `users` güncellemesinde `role/approved/email`
  bir trigger ile kilitlidir (ayrıcalık yükseltme engeli).

## Deploy (Hostinger)
`npm run build` → `HOSTINGER_UPLOAD/` içeriğini sunucu köküne yükle. `.htaccess`
sıkıştırma (gzip/brotli), güvenlik başlıkları (HSTS/CSP/…), SPA fallback ve HTTPS
yönlendirmesini içerir. Deploy öncesi review şarttır.

---
*Owner: Şafak Özkan · Geliştirme: NodeWorks (nodeworks.at)*
