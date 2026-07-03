# RE-SET — Proje Durumu (kanonik)

> Oturum başında bunu oku, sonunda güncelle. Hedef: siteyi SEO/GEO/AEO,
> performans, güvenlik, yasal ve teknik açıdan **10/10** seviyesine getirmek.
> Ana anahtar hedefi: "demartini metodu/yöntemi", "şafak özkan demartini",
> "demartini türkiye/istanbul" + AI cevap motorlarında atıf.

**Son güncelleme:** 2026-07-03

## Gerçekçi hedef beklentisi
Çıplak "demartini" #1 global olarak Dr. John Demartini'nin markasının; sadece
on-page ile alınamaz. Kazanılabilir: yukarıdaki uzun-kuyruk + yerel + AI atıf.

---

## Faz durumu

### 🔴 FAZ 0 — Güvenlik (repo PUBLIC olduğu için acil)
Kod tarafı ✅ tamam · Kullanıcı aksiyonları ⏳ bekliyor
- [x] Sırları working-tree'den temizle: `env.ts`, `.env.example`, `README`, `.mcp.json`→`.example`+gitignore
- [x] `.htaccess`: gzip/brotli + HSTS/CSP/X-Frame/nosniff/Referrer/Permissions + immutable cache
- [x] RLS teşhis + otoriter migration yazıldı (`_sql_migrations/2026-07-03_00_DIAGNOSE.sql`, `_01_authoritative_rls.sql`)
- [x] `AuthContext` admin belirlemesinden `user_metadata` çıkarıldı
- [x] ✅ **RLS DÜZELTMESİ CANLIYA UYGULANDI + DOĞRULANDI** (Management API, PAT ile): C2/H1/M1 kapandı; `user_metadata`'ya güvenen politika 0; ayrıcalık-kilidi trigger'ı aktif; is_admin() temiz. Not: yeni admin eklemek için `admin_emails` tablosuna e-posta ekle (role='ADMIN' tek başına RLS-admin vermez).
- [x] ✅ M2: `users.password` kolonu DÜŞÜRÜLDÜ (canlı, doğrulandı); `AccountSettingsTab` şifre değiştirme Supabase Auth'a taşındı (düz-metin karşılaştırma kaldırıldı)
- [ ] Advisor: 35 WARN (çoğu function_search_path_mutable; 1 rls_policy_always_true; 1 public_bucket_allows_listing) — minör, sonra
- [ ] **KULLANICI:** PAT `sbp_d02...` sohbete girdiği için Supabase'den **iptal et** (Account → Access Tokens → revoke) (app_metadata + sabit email)
- [ ] **KULLANICI:** admin şifresini (`123456`) döndür — public repo'da sızdı
- [ ] **KULLANICI:** TestSprite API key'ini iptal et (public repo'da sızdı)
- [ ] **KULLANICI:** RE-SET Supabase'i MCP'ye bağla **veya** DIAGNOSE.sql'i çalıştırıp çıktıyı paylaş → sonra RLS migration uygula
- [x] ✅ **git history purge YAPILDI + PUSH'LANDI** (2026-07-03): `git-filter-repo` ile `.mcp.json` tüm history'den çıkarıldı + TestSprite key (`testsprite_tests/tmp/config.json`'da da vardı) REDACTED'e çevrildi; hiçbir commit'te key yok. Yedek: `~/reset-backup-20260703-050846.bundle`. `origin/main` force-push edildi (remote HEAD temiz). NOT: GitHub eski SHA'yı GC'ye kadar cache'leyebilir → gerçek koruma key revoke.
- [x] ✅ **Working-tree review + 5 commit** (güvenlik / SEO / perf / temizlik / handle-fix); tsc temiz, `npm run build` 12 sayfa prerender OK. HENÜZ HOSTING'E DEPLOY EDİLMEDİ (sadece git push).

### 🟠 FAZ 1 — SEO/GEO ana fix (devam ediyor)
- [x] Title çift-suffix düzeltildi (`SEO.tsx`: `fullTitle = title`)
- [x] `SEO.tsx` readdy.ai harici default kaldırıldı → `/og-image.jpg` (mutlak URL)
- [x] Ölü meta (`language`, `revisit-after`) kaldırıldı; og:site_name marka tutarlı
- [x] Home H1'e statik "Demartini Yöntemi (Metodu) · Şafak Özkan · İstanbul" satırı
- [x] Statik JSON-LD'ye Person + Organization `sameAs` (instagram + youtube) eklendi
- [x] `og-image.jpg` üretildi (1200×630, markalı; kaynak `scripts/og-card.html`, headless Chrome+sips)
- [x] **`prerender.tsx` boş body → gerçek statik HTML** ✅ DOĞRULANDI (build+headless render): 12 sayfa, H1+entity+FAQ+FAQPage JSON-LD statik HTML'de; React createRoot ile temiz mount
- [x] hreflang kaldırıldı (tek dilli, yanıltıcıydı) · sitemap home trailing-slash `/` (canonical ile tutarlı)
- [ ] `AggregateRating`+`Review`, `VideoObject`/`PodcastEpisode` şema (gerçek yorum verisi gerekiyor)
- [x] ✅ YouTube handle çözüldü: `@SafakOzkan-y6i` (sitenin gerçek kanalı; sameAs index.html+about hizalandı). @safakozkan yanlıştı, kaldırıldı.

### 🟡 FAZ 2 — Performans (başladı)
- [x] Font Awesome kaldırıldı (index.html) — hiç kullanılmıyordu; CSP'den cdnjs düşürüldü
- [x] jsDelivr (Remixicon) için `preconnect` eklendi
- [x] gzip/brotli + immutable cache (`.htaccess` — Faz 0'da yapıldı)
- [ ] Supabase SDK'yı public kritik yoldan çıkar (dynamic import / anon bail) — doğrulama gerekli
- [ ] Hero LCP statik default + preload · font/Remixicon self-host · CookieBanner lazy · görsel width/height+webp

### 🟢 FAZ 3 — İçerik otoritesi
- [ ] `/demartini-yontemi` pillar derinleştir · 8–15 makalelik blog kümesi · GBP + Wikidata · genişletilmiş FAQ

### ⚪ FAZ 4 — Teknik borç + yasal (başladı)
- [x] `src/i18n/` silindi (ölü kod; kurulu olmayan i18next/react-i18next import ediyordu)
- [x] Junk temizlendi: `AuthContext 2.tsx`, `blog/page 2.tsx`, tüm `.DS_Store`, `.git/*2.lock`
- [x] Build artifact'lar untrack: `playwright-report`, `test-results`, `testsprite_tests`
- [x] README gerçek ürünü yansıtacak şekilde yeniden yazıldı · `package.json` name/version düzeltildi
- [ ] 43 `any` → Supabase generated types (DB erişimi/CLI gerekli)
- [ ] KVKK metni (özel nitelikli veri/açık rıza/yurt dışı aktarım) — hukuk onayı gerekir · contact/reviews rate-limit (Turnstile)

### 🟡 FAZ 2 — Performans (devam)
- [x] AuthContext anonim-bail: token yoksa `getSession` ağ çağrısı atlanır (LCP kritik yolu)
- [x] CookieBanner lazy-load (ayrı chunk; consent default-denied)
- [ ] Supabase SDK 125KB tam dynamic-import (daha büyük refactor) · hero LCP statik default · font/Remixicon self-host

---

## Denetim özeti (4 paralel ajan, 2026-07-03)
- **Performans:** route code-split ✅; ama 3 render-bloklayan CDN (biri hiç kullanılmayan Font Awesome), Supabase 125KB kritik yolda, hero LCP client-fetch, sıfır sıkıştırma.
- **SEO/GEO/AEO:** metadata/schema/içerik güçlü; ama prerender boş body → AI botları hiçbir şey görmüyor (ana kusur), og-image 404, title çift-suffix, H1'de Demartini yok, blog 1 yazı.
- **Güvenlik:** service_role sızıntısı yok ✅, DOMPurify ✅, consent ✅; ama admin şifre 123456 (public), RLS `user_metadata` escalation, users self-UPDATE WITH CHECK yok, sıfır güvenlik başlığı.
- **Teknik:** CI ✅, strict TS ✅, gerçek smoke testler ✅; ama TestSprite key commit'li, `src/i18n` kurulu olmayan paket import ediyor (ölü), " 2" duplicate dosyalar, 43 `any`. Git "takılması" = pager+iCloud (çözüldü: `core.pager=cat`).

## Notlar
- RE-SET Supabase projesi: `woaenxpydppxyfphwdix` — bağlı MCP hesabında DEĞİL (farklı hesap).
- Değişiklikler henüz commit/deploy edilmedi (review şart — deploy disiplini).
