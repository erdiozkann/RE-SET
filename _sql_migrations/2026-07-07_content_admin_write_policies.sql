-- RE-SET — İçerik panelinden yazma DB'ye işlemiyor: KÖK ÇÖZÜM
-- Bulgu (ADIM B): tüm içerik tablolarında RLS açık ama YALNIZ SELECT politikası
-- var; admin için INSERT/UPDATE/DELETE yok → panelden yapılan her düzenleme
-- (hero görseli dahil) 0 satır etkiliyor, sessizce kayboluyor.
--
-- Çözüm: her içerik tablosuna is_admin() tabanlı FOR ALL (yazma) politikası ekle.
-- Public SELECT politikaları KORUNUR (permissive/OR); herkes okumaya devam eder,
-- yalnız admin yazabilir. Idempotent: tekrar çalıştırılabilir.
--
-- Uygula: Supabase Dashboard → SQL Editor → tümünü çalıştır.

-- ── Ön koşul: is_admin() var mı? (yoksa DURUN — admin fonksiyonunuzun adını kullanın)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    RAISE EXCEPTION 'public.is_admin() bulunamadı. Bu migrasyon is_admin() gerektirir; admin-belirleme fonksiyonunuzun adıyla değiştirin.';
  END IF;
END $$;

-- ── Her içerik tablosuna admin FOR ALL yazma politikası (idempotent)
DO $$
DECLARE
  t text;
  content_tables text[] := ARRAY[
    'hero_contents','about_contents','contact_info','methods','services',
    'site_pages','blog_posts','podcast_episodes','youtube_videos',
    'legal_contents','certificates','profile_images','working_config','reviews'
  ];
BEGIN
  FOREACH t IN ARRAY content_tables LOOP
    -- Tablo gerçekten var mı? (yoksa atla)
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
               WHERE n.nspname='public' AND c.relname=t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t||'_admin_write', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
           USING (public.is_admin()) WITH CHECK (public.is_admin())',
        t||'_admin_write', t
      );
      RAISE NOTICE 'admin yazma politikası eklendi: %', t;
    ELSE
      RAISE NOTICE 'tablo yok, atlandı: %', t;
    END IF;
  END LOOP;
END $$;

-- ── Doğrulama: artık her tabloda UPDATE/INSERT/DELETE (ALL) politikası görünmeli
SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname='public'
  AND tablename = ANY (ARRAY[
    'hero_contents','about_contents','contact_info','methods','services',
    'site_pages','blog_posts','podcast_episodes','youtube_videos',
    'legal_contents','certificates','profile_images','working_config','reviews'
  ])
ORDER BY tablename, cmd;
