# RE-SET — Proje Durumu (kanonik)

> Oturum başında bunu oku, sonunda güncelle. Hedef: siteyi SEO/GEO/AEO,
> performans, güvenlik, yasal ve teknik açıdan **10/10** seviyesine getirmek.
> Ana anahtar hedefi: "demartini metodu/yöntemi", "şafak özkan demartini",
> "demartini türkiye/istanbul" + AI cevap motorlarında atıf.

**Son güncelleme:** 2026-07-07

## Gerçekçi hedef beklentisi
Çıplak "demartini" #1 global olarak Dr. John Demartini'nin markasının; sadece
on-page ile alınamaz. Kazanılabilir: yukarıdaki uzun-kuyruk + yerel + AI atıf.

---

## 🚀 BÜYÜK REVİZE (2026-07-07) — canlı VPS, tek-shot `deploy/vps/deploy.sh`
Site VPS'te (nginx+Traefik+LE, `82.29.180.227`, `/docker/reset`). Denetim + batch planı: Obsidian `03_Projects/RE-SET/01_AZ_Denetim_Aciklar.md` + `02_Buyuk_Revize_Plani.md`.

- ✅ **Batch 0 (acil fonksiyonel)** — contact form `name` bug (firstName+lastName), /booking noindex+kayıt-duvarı kaldırıldı, AccountSettingsTab (useAuth+auth.updateUser), **sitemap/robots/llms-full canlıda 403'tü** (dosyalar 600→container nginx okuyamıyor; `deploy.sh` `chmod -R a+rX html` + generate script'leri 644), placeholder telefon kaldırıldı.
- ✅ **Batch 1 (marka + meta tek-kaynak)** — `src/lib/routeMeta.ts` TEK KAYNAK (prerender + tüm public sayfalar); title-flip (T1) çözüldü; "Reset/Reset Danışmanlık" → "RE-SET" her yerde (sayfalar+Footer+Header+schema+**index.html shell**); keyword prop'ları silindi. İstisna: gerçek danışan yorumundaki "Reset süreciyle…" verbatim.
- ✅ **Batch 2 (içerik/SEO/YMYL)** — tıbbi iddia klinik-olmayan dile (C4)+disclaimer'lar; "bilimsel" overclaim ölçüldü (O5); **11 yıl** her yerde (H5, "binlerce danışan" uydurması kaldırıldı); **YENİ 2. dikey: `/primordial-ses-meditasyonu`** (Service+FAQPage schema, prerender zengin gövde, sitemap, Header/Footer nav, llms-full); copyright yıl dinamik.

### ✅ NAP çözüldü (C3, 2026-07-07): kullanıcı → adres **"Tarabya, İstanbul"** (sokak/no yok)
Tüm kod/statik tek elden "Tarabya, İstanbul"a çekildi: iki çelişen sokak adresi kaldırıldı, "Nişantaşı" → "Tarabya" (23 geçiş), schema `addressRegion` il=İstanbul, yanlış Nişantaşı koordinatları (41.0534;28.9943) index.html+home'dan silindi (gerçek pin GBP'de). Canlı: Nişantaşı x0.

### ✅ HERO + GÜVENLİK (2026-07-07, Management API ile doğrudan çözüldü/denetlendi)
- **Hero görseli düzeldi:** DB'deki tek satır (a733febc) eski görseli tutuyordu; kullanıcının bugün yüklediği en yeni görsele (`1783393565740-5wwfnb.png`) set edildi. Anon+webp 200, doğrulandı.
- **Kök neden (panel kaydetmiyordu):** RLS/is_admin/client hepsi doğru (is_admin() info@ için true, "Admin All Access" politikası hep vardı). Statik analizle hata yok → muhtemelen tarayıcıda cached-rol ile girişli görünüp aktif Supabase oturumu olmaması. Taze giriş (info@re-set.com.tr) ile panel yazmaları çalışmalı.
- **admin_emails temizlendi:** yalnız `info@re-set.com.tr` (kullanıcı isteği; admin@re-set.com.tr çıkarıldı — is_admin() içinde zaten hardcoded).
- **GÜVENLİK DENETİMİ (token ile):** RLS TÜM public tablolarda açık ✅ · anon-okuma sızıntısı YOK ✅ · write policy'ler sağlam (appointments own-only, reviews approved=false, users self-register CLIENT-only=yetki yükseltme yok, site_pages is_admin) ✅ · tek zayıf: contact_messages INSERT `true` (spam; Traefik rate-limit hafifletiyor, Turnstile ileride).
- ✅ **Hayalet admin silindi** (`admin@reset.com`): artık yalnız `info@re-set.com.tr` (gerçek auth) ADMIN.
- ✅ **Blog görselleri:** 10 yazının hepsinde görsel var; panel BlogTab thumbnail gösteriyor; liste+detay **sunucu-tarafı 16:9 kırpma** (`optimizedImage` resize=cover) ile birebir tutarlı.
- ⏳ **Token'ı İPTAL ET** (Management API PAT sohbette göründü; yerel dosya silindi). Supabase → Account → Access Tokens → `reset-fix` sil.

### 🔴 KRİTİK BULGU (2026-07-07): İçerik tablolarında admin YAZMA politikası YOK
ADIM B çıktısı: hero_contents/about_contents/contact_info/methods/services/site_pages/
blog_posts/podcast_episodes/youtube_videos/reviews/working_config → hepsinde RLS açık
ama **yalnız SELECT** politikası var; INSERT/UPDATE/DELETE yok → **panelden hiçbir içerik
DB'ye yazılamıyor** (hero görseli bunun görünen ucu). ÇÖZÜM hazır:
- `_sql_migrations/2026-07-07_content_admin_write_policies.sql` → her içerik tablosuna
  `is_admin()` tabanlı FOR ALL yazma politikası (idempotent). Bunu çalıştır → panel düzelir.
- `_sql_migrations/2026-07-07_sensitive_tables_leak_check.sql` → clients/appointments/
  progress/contact_messages/finans tablolarında anon-okuma SIZINTISI var mı (salt-okuma).
  Çıktıyı Erdi'ye ilet; sızıntı varsa admin-only politikayla kapat.

### 🌐 CLOUDFLARE CDN GEÇİŞİ (2026-07-08, browser-otomasyonla Claude yaptı)
Hedef: TR'den <1sn (CDN edge). Durum: **nameserver'lar Hostinger'da Cloudflare'e çevrildi, yayılım bekleniyor.**
- ✅ CF zone: re-set.com.tr (Free, Erdiozkann hesabı). DNS kayıtları düzeltildi:
  apex A → 82.29.180.227 **DNS only** (kesintisiz geçiş; edge cert sonrası turuncu yapılacak);
  **5 mail CNAME'i Proxied'dan DNS only'ye çekildi** (DKIM/autoconfig kırılırdı);
  **www → re-set.com.tr (Proxied)** — eski Hostinger CDN hedefi kaldırıldı; ftp DNS only; AAAA yok.
- ✅ SSL/TLS mode: **Full (strict)** (origin'de geçerli LE cert var).
- ✅ Redirect Rule aktif: `https://www.*` → 301 root (query korunur).
- ✅ Hostinger NS: ns1/ns2.dns-parking.com → **gabriel.ns.cloudflare.com + kara.ns.cloudflare.com** ("Ad sunucuları değişti!" onayı alındı; yayılım 24sa'e kadar).
- ⏳ **Registry teyidi (2026-07-08):** .tr TLD sunucuları (`ns75.ns.tr`) hâlâ dns-parking gösteriyor (TTL 43200=12sa) — Hostinger kabul etti, TRABİS'e işlenmesi bekleniyor. Hızlandırılamaz.
- 📋 **AKTİVASYON-SONRASI KONTROL LİSTESİ** (zone Active olunca sırayla):
  1. SSL/TLS → Edge Certificates → Universal SSL "Active" doğrula
  2. DNS → apex A kaydını **Proxied (turuncu)** yap → `cf-ray` header + TR hız ölç
  3. **AI Crawl Control → AI botlarını ENGELLEME** (onboarding "block" önerecek; GEO stratejimiz GPTBot/ClaudeBot/PerplexityBot/Google-Extended İZİN istiyor — robots.txt ile uyumlu bırak)
  4. Speed → Early Hints **Enable** (pending'de kilitliydi)
  5. Origin Cert kur (Traefik) → sonra "Always use HTTPS" aç (LE HTTP-01 riskini önce kapat)
  6. www → apex 301 canlı test
- ⚠️ LE yenileme notu: proxy açıkken HTTP-01 riskli olabilir → kalıcı çözüm Origin Cert.

### 🔧 SEARCH CONSOLE FIX (2026-07-09): Review snippet kritik hatası
GSC: "itemReviewed alanı için geçersiz nesne türü" (kritik). Neden: prerender'daki Review
JSON-LD `itemReviewed: Person` kullanıyordu — yorum snippet'i için geçersiz tür; ayrıca kendi
sitesinde kendi hizmetine Review markup'ı Google'da self-serving (gösterilmez). Fix: Review
JSON-LD tamamen kaldırıldı, GÖRÜNÜR testimonial korundu (blockquote, / + /demartini-yontemi).
Canlı doğrulandı: itemReviewed=0, görünür yorum ✓. **ERDİ:** GSC'de sorun sayfasında
"Doğrulamayı Başlat" (Validate Fix) butonuna bas — Google yeniden tarayıp kapatır (birkaç gün).

### 💰 PARA SAYFALARI CANLI (2026-07-08) + hız/podcast fix'leri
- ✅ **3 hizmet landing'i yayında** (prerendered, Service+FAQPage+Breadcrumb schema, `data/serviceFaqs.ts` tek kaynak): `/demartini-seansi` (0.95, "demartini istanbul/seansı/randevu/online"), `/deger-belirleme`, `/breakthrough-experience`. Footer + /demartini-yontemi iç bağlantıları. Fiyat yok, tıbbi iddia yok.
- ✅ **"Site 10sn açılıyor" KÖK NEDENİ ÇÖZÜLDÜ:** supabasePublic aynı auth storageKey'i paylaşıyordu → panel sekmesi kilidi tüm içerik sorgularını 9.5sn kuyrukta bekletiyordu. `storageKey:'sb-reset-public'` izolasyonu → sorgular 9500ms→453ms (kullanıcı tarayıcısından ölçüldü).
- ✅ **Podcast çalıyor:** Spotify sayfa linkleri HTML5 player'da çalmıyordu → resmi **Spotify embed** (episode iframe) + CSP frame-src open.spotify.com. Canlı doğrulandı.
- ✅ HTML no-cache (stale-HTML kırılması bitti) + deploy.sh inode/`--force-recreate` düzeltmeleri.
- ⏳ NS yayılımı hâlâ bekleniyor (gabriel/kara.ns.cloudflare.com; izleyici arka planda). Aktif olunca: apex→turuncu, cf-ray+hız doğrula, Origin Cert.

### ⏳ Kullanıcı/Şafak/PANEL aksiyonları (kod tarafı bitti, bunlar bekliyor)
**SQL Editor'de çalıştır (ayrı Supabase hesabı, MCP'de değil):**
- `_sql_migrations/2026-07-07_appointments_unique_slot.sql` → çifte-booking DB kilidi (H2 tam koruma).
- `_sql_migrations/2026-07-08_security_hardening.sql` → RLS insert CHECK + bucket + advisor (önceki batch).

**Admin panelden içerik güncelle (DB, koddan erişilemiyor):**
- ⚠️ **"John Demartini Kimdir?" blog yazısı** gövdesinde hâlâ "Nişantaşı … 15 yılı aşkın" → "Tarabya" + "11 yıl" (blog + llms-full'e sızıyor).
- ⚠️ **KVKK içeriği** DB'den geliyor ve component default'unu ezer → panelden yeni genişletilmiş KVKK metnini gir (özel nitelikli veri/açık rıza/yurtdışı aktarım). **Hukuk onayı önerilir.**
- 📇 **contactInfo.address** → "Tarabya, İstanbul" (Footer/contact schema oradan streetAddress çeker).

**Kod-dışı / manuel:**
- **`og-image.jpg` regen**: `scripts/og-card.html` "Tarabya" oldu; statik JPG headless Chrome+sips ile yeniden üretilmeli.
- **Güvenlik (önceki, geçerli):** admin şifresini döndür (eski şifre repo geçmişinde göründü), sızmış PAT/TestSprite key revoke.

**Marka/tasarım kararı:**
- Altın `#D4AF37` metin AA kontrastı geçmiyor (T9) — koyu hardal tonu marka kararı ([[nodeworks-brand]]).

---

## 🗓️ 2026-07-09 (2. tur): CI yeşil + güvenlik hijyeni (git d381cdc)
- [x] ✅ CI kırmızı→yeşil: finance/service.ts 2x no-empty (boş catch) + kolay unused-vars; lint 0 error (57 warning kaldı, çoğu `any`)
- [x] ✅ Admin şifresi düz metin repo'dan çıkarıldı: DELIVERY_CHECKLIST + 2 Playwright spec → ADMIN_EMAIL/ADMIN_PASSWORD env (yoksa skip); STATUS.md redakte. Şifre history'de görünür → gerçek koruma ROTASYON (kullanıcı aksiyonu).
- [x] ✅ testsprite_tests/ untrack edildi (gitignore'daydı ama izliydi); AuthContext @testsprite.com arka kapı koşulları kaldırıldı
- [x] ✅ gitleaks: 60 commit history TEMİZ (3 Tem purge tuttu); working-tree 5 bulgu = yalnız anon key (public by design, gitignore'lu dosyalar)
- [x] .supabase-token dosyası silinmiş — Supabase'den token İPTALİ hâlâ kullanıcıda

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
- [ ] **KULLANICI:** admin şifresini döndür (eski şifre repo geçmişinde göründü) — public repo'da sızdı
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
- **Güvenlik:** service_role sızıntısı yok ✅, DOMPurify ✅, consent ✅; ama admin şifresi repo geçmişinde göründü (rotasyon şart), RLS `user_metadata` escalation, users self-UPDATE WITH CHECK yok, sıfır güvenlik başlığı.
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

## ✅✅ VPS CUTOVER TAMAMLANDI — SİTE CANLI (2026-07-07)
- [x] re-set.com.tr → 82.29.180.227 (A). ALIAS silindi (kullanıcı), `@` artık A.
- [x] **Geçerli Let's Encrypt cert + HTTPS 200** — nginx/1.31.2 (VPS) Traefik arkasında
- [x] Kök neden çözüldü: eski **AAAA (Hostinger CDN IPv6)** ACME'yi bozuyordu (LE IPv6'yı tercih→eski sunucu→404). AAAA kalkınca cert geldi.
- [x] www reset router'ından çıkarıldı (www Hostinger'da kalıyor — kullanıcı tercihi)
- [x] Canlı doğrulama: meta keywords 0, Trained (Sertifikalı 0), priceRange 0, 15 FAQ, /methods→301, gzip, CSP+HSTS — hepsi VPS'ten
- [x] **Tek-komut deploy: `./deploy/vps/deploy.sh`** (build+rsync+compose up)
- NOT: www.re-set.com.tr hâlâ Hostinger CDN'de. VPS'e almak istenirse: www CNAME+AAAA sil, www A→82.29.180.227 ekle, router'a www geri ekle.
- Kalan: FAZ 2 içerik sayfaları (site_pages) taslak — Şafak input (klinik unvan + bio + seans anlatımı) gelince panelden yayınla.

## FAZ 3 başladı — Tier-3 fırsat yazıları (2026-07-07)
- [x] Tier-3 (4 yayında): duygusal yük, değerlerini keşfetmek, kırgınlığı bırakmak, karar verememe. Blog=10, hepsi prerendered.
- [x] Tek-shot deploy akışı doğrulandı: yaz → panel → `./deploy/vps/deploy.sh` → canlı
- Blog = 8 yazı. Sıradaki Tier-3: kırgınlığı bırakmak, karar verememe, öz sabotaj, erteleme-ve-değerler.
- FAZ 2 sayfaları (demartini-seansi/deger-belirleme/nasil-uygulanir/sss) draft — Şafak input (klinik unvan+bio) bekliyor.

## FAZ 3 güncel (2026-07-07): 4 Tier-3 yazı YAYINDA (blog=10)
- duygusal yük · değerlerini keşfetmek · kırgınlığı bırakmak · karar verememe — hepsi canlı+prerendered, tek-shot deploy ile
- Kalan Tier-3: öz sabotaj, erteleme-ve-değerler (opsiyonel)
- Asıl dönüşüm: FAZ 2 para sayfaları (demartini-seansi/deger-belirleme) — Şafak input (klinik unvan + bio) gelince yayınlanır
