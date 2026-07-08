-- RE-SET — İçerik panelinden KAYIT DB'ye yazmıyor: kapsamlı RLS teşhis + fix
-- Belirti: hero görseli (ve olası diğer içerikler) panelden "Kaydet" deniyor ama
-- DB güncellenmiyor → home'da değişmiyor. Tipik kök neden: içerik tablosunda RLS
-- açık ama ADMIN için UPDATE/INSERT/DELETE politikası eksik → yazma 0 satır etkiler,
-- kayıt sessizce başarısız olur (bazen .single() nedeniyle hata toast'u çıkar).
--
-- Supabase Dashboard → SQL Editor'de sırayla çalıştır. ADIM A/B teşhis, ADIM C fix.

-- ═══════════════════════════════════════════════════════════════════════════
-- ADIM A — Mevcut hero satırı
-- ═══════════════════════════════════════════════════════════════════════════
SELECT id, left(image, 80) AS image, created_at FROM public.hero_contents;

-- ═══════════════════════════════════════════════════════════════════════════
-- ADIM B — TÜM içerik tablolarında RLS + politika denetimi
--   İçerik tabloları: panelden düzenlenen public içerik. cmd bazında hangi
--   politikalar var? UPDATE/INSERT/DELETE eksikse admin yazamaz.
-- ═══════════════════════════════════════════════════════════════════════════
WITH content_tables(t) AS (
  VALUES ('hero_contents'), ('about_contents'), ('contact_info'),
         ('methods'), ('services'), ('site_pages'), ('blog_posts'),
         ('podcast_episodes'), ('youtube_videos'), ('reviews'),
         ('working_config')
)
SELECT c.t AS tablo,
       COALESCE(bool_or(cls.relrowsecurity), false) AS rls_acik,
       string_agg(DISTINCT p.cmd, ', ' ORDER BY p.cmd) AS mevcut_politikalar
FROM content_tables c
LEFT JOIN pg_class cls ON cls.relname = c.t
LEFT JOIN pg_policies p ON p.schemaname='public' AND p.tablename = c.t
GROUP BY c.t
ORDER BY c.t;
-- Yorum: "mevcut_politikalar" içinde UPDATE görünmeyen ve rls_acik=true olan
-- tablolar, admin panelinden GÜNCELLENEMEZ. hero_contents muhtemelen bunlardan.

-- is_admin() var mı? (fix bunu kullanır)
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- ═══════════════════════════════════════════════════════════════════════════
-- ADIM C — FIX: admin (is_admin()) için eksik yazma politikalarını kur.
--   Yalnız gerçekten eksik olan tablolarda uygula. Aşağıda hero_contents için
--   örnek; ADIM B'de UPDATE'i eksik çıkan DİĞER tablolar için t adını değiştirip
--   tekrarla. is_admin() ADIM B'de boş döndüyse, kendi admin-belirleme
--   fonksiyonunuzun adını koşula koyun.
--
--   NOT: is_admin() SECURITY DEFINER + search_path sabit olmalı (advisor uyarısı).
-- ═══════════════════════════════════════════════════════════════════════════

-- hero_contents — admin tam yazma (UPDATE + gerekiyorsa INSERT)
DROP POLICY IF EXISTS hero_contents_admin_write ON public.hero_contents;
CREATE POLICY hero_contents_admin_write
  ON public.hero_contents
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ADIM B'de UPDATE'i eksik çıkan her tablo için şablon (t'yi değiştir):
--   DROP POLICY IF EXISTS <t>_admin_write ON public.<t>;
--   CREATE POLICY <t>_admin_write ON public.<t>
--     FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- ADIM D — Doğrulama: politikalar oluştu mu?
-- ═══════════════════════════════════════════════════════════════════════════
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname='public' AND tablename='hero_contents'
ORDER BY cmd;
