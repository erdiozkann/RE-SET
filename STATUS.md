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
- [x] ✅ **VideoObject/PodcastEpisode/Review + blog listesi prerendered HTML'e girdi** (2026-07-03): build zamanında youtube_videos(8)/podcast_episodes(2)/reviews(1)/blog_posts(1) çekilip `/youtube`,`/podcast`,`/blog` gövdesine taranabilir liste + JSON-LD enjekte. AggregateRating YOK (1 yorum = self-serving, honest-data). Bonus: `import.meta.env` fix'iyle blog detay sayfaları artık prerender oluyor (process.env boştu).
- [x] ✅ **FAQ tek kaynağa çekildi + 8→15 soru** (`src/data/faq.ts`; home görünür+JSON-LD+prerender senkron, cloaking yok). Yeni kelime-hedefli sorular: John Demartini kimdir, Yöntem=Metot, Breakthrough Experience, Değer Belirleme/değerler hiyerarşisi, Quantum Collapse, hangi konular, terapi mi. index.html meta keywords tam kümeye genişletildi.
- [x] ✅ YouTube handle çözüldü: `@SafakOzkan-y6i` (sitenin gerçek kanalı; sameAs index.html+about hizalandı). @safakozkan yanlıştı, kaldırıldı.

### 🎯 İçerik otoritesi hedefi (kullanıcı, 2026-07-03): "Demartini/John Demartini aramalarında + GEO/AEO ilk sayfa; blog'u kullan"
- **Dürüst beklenti:** "demartini metodu/yöntemi (Türkiye/İstanbul)" + uzun-kuyruk + AEO atıf = KAZANILABİLİR (foundation hazır). Çıplak "john demartini" #1 = Dr. Demartini'nin kendi global markası, on-page ile zor; "john demartini kimdir/türkçe/metodu" hedeflenebilir.
- **BLOG KÜMESİ — 5 makale YAYINLANDI** (2026-07-03, admin panelden browser otomasyonuyla): John Demartini Kimdir?, Değer Belirleme Süreci (13 soru), Breakthrough Experience, Demartini ile Kaygı, Demartini vs Koçluk vs Terapi. Hepsi markdown (gerçek H2/H3), AEO soruları, iç link, tıbbi uyarı. Taslaklar repoda `content/blog/*.md`. Toplam blog = 6 yazı, 6 sayfa prerender.
- **Markdown render açıldı** (`marked` + `src/lib/markdown.ts`): blog detay client'ta DOMPurify'lı, prerender'da statik `<article>` H2/H3/p → SEO/AEO için gerçek yapı.
- Kalan (opsiyonel): pillar derinleştir, ilişki dengeleme, minnettarlık, travma, seans süreci makaleleri. Kapak görselleri boş (placeholder) — panelden eklenebilir.
- ⚠️ **REDEPLOY GEREK:** yeni makaleler + markdown render git'te ve build'de var ama Hostinger'da DEĞİL. Yeni ZIP Desktop'ta (`RE-SET-deploy-*.zip`, 87 dosya). Canlıda şu an yeni yazılar `##` düz metin görünür; redeploy sonrası düzelir.

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

---

## 🗺️ MASTER SEO/GEO/AEO PLANI (2026-07-06 — kanonik yol haritası)
Erdi'den gelen tam plan konuşmada; özeti + uyum durumu:

### Bu oturumdaki işlerle UYUMSUZLUKLAR (Faz 1'de düzeltilecek)
- 🔴 **Meta keywords**: Bu oturumda index.html'e geniş keyword listesi EKLEDİM. Plan Kural 4 + Faz 1: **meta keywords TAMAMEN SİLİNECEK** (Haziran 2026 Spam Update sinyali). → Faz 1 görevi.
- 🟠 **Yayınlanan 5 blog yazısı** (John Demartini, Değer Belirleme, Breakthrough, Kaygı, Koçluk/Terapi): plan bunları Tier-2 kabul eder ama **Bölüm 7 şablonuna** (cevap kapsülü + PAA H2 + Şafak özgün katkısı + disclaimer + "son güncelleme") uymuyorlar. Faz 2'de şablona revize + disclaimer (3.3) eklenecek.
- 🟠 **Title'lar**: "demartini yöntemi ve metodu" keyword-yığını → plan ≤60 karakter temiz format istiyor.

### Faz sırası (plan Bölüm 12)
- **FAZ 0** (şu an): lisans ✅ · 13 TR facilitator rekabet kontrolü (running) · AI baseline 15 sorgu (running) · Şafak input listesi ✅ `docs/SAFAK-INPUT-LISTESI.md`
- **FAZ 1**: teknik temizlik — meta keywords sil, title/description yeniden yaz, sitemap→GSC, robots (AI crawler'lara İZİN), 301, schema altyapısı. *Yeni içerikten ÖNCE biter.*
- **FAZ 2**: 3→14 sayfa çekirdek içerik (Bölüm 6 mimarisi), her sayfa Bölüm 7 şablonu + Erdi onayı
- **FAZ 3**: blog (Tier-3) + GBP + YouTube + misafir yazı
- **FAZ 4**: aylık KPI + iterasyon

### Mutlak kurallar (Bölüm 0)
İnsan onayı olmadan yayın yok · uydurma yok (kaynak URL şart) · YMYL: tıbbi iddia yasak + disclaimer · keyword stuffing yasak · her sayfaya Şafak'ın gerçek katkısı · unvan "Trained/Eğitimli" (Sertifikalı/Master DEĞİL).

**KPI baseline (Tem 2026):** 3 indeksli sayfa, ~35 gösterim/ay, "demartini metodu" poz. 13.4, AI atıf 0/15.

---
## ✅ FAZ 1 TAMAMLANDI (2026-07-07) — onay bekliyor
- [x] Meta keywords SİLİNDİ (index.html + SEO.tsx her zaman strip) — spam sinyali
- [x] **Unvan düzeltmesi (plan 3.1): "Sertifikalı"→"Eğitimli (Trained)"** — kod (Person jobTitle, prerender, FAQ, home, about, blog şema, llms.txt) + 5 blog draft + **3 CANLI DB yazısı** (John Demartini/Değer Belirleme/Breakthrough admin panelden düzeltildi). Yanlış "Certified" beyanı kalktı.
- [x] Person sameAs → drdemartini.com/facilitators (doğrulama linki)
- [x] www→apex 301 (.htaccess)
- [x] Article+BreadcrumbList şema blog detayda mevcut · robots AI-crawler izin ✅ · /methods 301 ✅
- [ ] **KULLANICI:** sitemap → GSC gönder (iki mülk) — ben gönderemem
- [ ] **ŞAFAK ONAYI:** about bio "aldığım uluslararası sertifikalarımla" → kendi öz-geçmişi, dokunulmadı; softlanacak mı?
- [ ] Title/description ≤60 ince ayar + disclaimer (3.3) → FAZ 2'ye taşındı (içerik sayfalarıyla)
- ⚠️ REDEPLOY GEREK: FAZ 1 kod+DB düzeltmeleri HOSTINGER_UPLOAD'da hazır, Hostinger'a yüklenmeli.

---
## FAZ 2 — CMS "Sayfalar" sistemi kuruldu (2026-07-07)
- [x] `site_pages` tablosu + RLS **CANLIYA UYGULANDI** (Management API/SQL Editor) — public read yayınlı, admin write
- [x] Kod: sitePagesApi + `/:slug` CmsPage (markdown+Service/Breadcrumb şema) + prerender fetch + admin "Sayfalar" tab (`src/pages/admin/components/PagesTab.tsx`)
- [x] 2 seed taslak: demartini-seansi, deger-belirleme (is_published=false → Şafak input sonrası panelden yayınla)
- [x] Fiyat public siteden tamamen kaldırıldı (priceRange, service price, ücret SSS)
- ⚠️ Admin "Sayfalar" tab + route'lar REDEPLOY sonrası canlıda
- KARAR: deploy artık **VPS üzerinden** (manuel Hostinger yok) — taşıma başlıyor

## ✅ VPS DEPLOY YAPILDI (2026-07-07) — DNS cutover bekliyor
- [x] Statik site rsync → VPS `/docker/reset/html` (70 dosya, default SSH key ile, scoped)
- [x] `reset` container (nginx:alpine) Traefik arkasında UP + `nginx -t` OK + içeride site sunuluyor (doğrulandı). Postiz'e dokunulmadı.
- [x] Traefik label'ları yerel postiz kopyasından doğrulandı: proxy ağı + entrypoints=websecure + certresolver=letsencrypt + port 80
- [x] Tek-komut redeploy: `deploy/vps/deploy.sh` (npm run build sonrası çalıştır)
- [ ] **KULLANICI/DNS:** Hostinger DNS → `re-set.com.tr` + `www` A kaydı → `82.29.180.227`. Sonra Traefik cert otomatik. Rollback: eski Hostinger IP.
- Not: DNS cutover sonrası tüm FAZ 1 (meta keywords sil, Trained düzeltmesi) + CMS route'ları + perf fix'leri canlı olur.
