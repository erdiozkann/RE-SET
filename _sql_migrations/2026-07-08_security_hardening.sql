-- ============================================================================
-- Güvenlik sıkılaştırma (FAZ B, K1/K2/K6)
-- RE-SET Supabase SQL Editor'de çalıştır. İdempotent + savunmacı.
--
-- Ne yapar:
--  1) TEŞHİS: contact_messages/reviews mevcut RLS politikalarını yazdırır (üstte).
--  2) CHECK: alan uzunluk sınırları (spam/dev payload'ı sınırlar) — additive, güvenli.
--  3) contact_messages SELECT → yalnız is_admin() (form yalnız INSERT eder; okuma admin).
--  4) contact_messages INSERT → anon/public açık kalır (form için) + CHECK'lerle sınırlı.
--  5) reviews INSERT → yalnız authenticated + approved=false (client-panel akışı) veya admin.
--  6) reviews SELECT → approved=true veya is_admin().
--  7) fonksiyon search_path (advisor) — bilinen fonksiyonlar.
--
-- NOT (bu migration'a DAHİL DEĞİL — ayrı, dikkatli ele alınacak):
--  - storage `public_bucket_allows_listing`: görsel sunumunu bozmamak için elle.
--  - başka fonksiyonların search_path'i: adları görülünce.
-- ============================================================================

-- 1) TEŞHİS (çıktıyı SQL Editor'de gör) --------------------------------------
SELECT tablename, policyname, cmd, roles::text AS roles, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename IN ('contact_messages','reviews')
ORDER BY tablename, cmd;

-- 2) CHECK uzunluk sınırları (additive) -------------------------------------
ALTER TABLE public.contact_messages DROP CONSTRAINT IF EXISTS cm_len_chk;
ALTER TABLE public.contact_messages ADD CONSTRAINT cm_len_chk CHECK (
  char_length(coalesce(name,''))    <= 120 AND
  char_length(coalesce(email,''))   <= 160 AND
  char_length(coalesce(phone,''))   <= 40  AND
  char_length(coalesce(subject,'')) <= 160 AND
  char_length(coalesce(message,'')) <= 2000
);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS rv_len_chk;
ALTER TABLE public.reviews ADD CONSTRAINT rv_len_chk CHECK (
  char_length(coalesce(name,'')) <= 120 AND
  char_length(coalesce(text,'')) <= 2000 AND
  (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- 3+4) contact_messages RLS -------------------------------------------------
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
-- Mevcut SELECT politikalarını temizle (form SELECT etmez; okuma admin olmalı)
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='contact_messages' AND cmd='SELECT'
  LOOP EXECUTE format('DROP POLICY %I ON public.contact_messages', p.policyname); END LOOP;
END $$;
DROP POLICY IF EXISTS cm_select_admin ON public.contact_messages;
CREATE POLICY cm_select_admin ON public.contact_messages FOR SELECT USING (public.is_admin());

-- INSERT: anon/public açık kalır (iletişim formu). Mevcut insert politikalarını
-- tekilleştirip tek net politika bırak.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='contact_messages' AND cmd='INSERT'
  LOOP EXECUTE format('DROP POLICY %I ON public.contact_messages', p.policyname); END LOOP;
END $$;
CREATE POLICY cm_insert_public ON public.contact_messages FOR INSERT WITH CHECK (true);

-- UPDATE/DELETE yalnız admin
DROP POLICY IF EXISTS cm_write_admin ON public.contact_messages;
CREATE POLICY cm_write_admin ON public.contact_messages FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS cm_delete_admin ON public.contact_messages;
CREATE POLICY cm_delete_admin ON public.contact_messages FOR DELETE USING (public.is_admin());

-- 5+6) reviews RLS ----------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- SELECT: yayınlı herkese, tümü admin'e
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='reviews' AND cmd='SELECT'
  LOOP EXECUTE format('DROP POLICY %I ON public.reviews', p.policyname); END LOOP;
END $$;
CREATE POLICY rv_select_public ON public.reviews FOR SELECT USING (approved = true OR public.is_admin());

-- INSERT: yalnız authenticated + approved=false (client-panel), veya admin. Anon KAPALI.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='reviews' AND cmd='INSERT'
  LOOP EXECUTE format('DROP POLICY %I ON public.reviews', p.policyname); END LOOP;
END $$;
CREATE POLICY rv_insert_auth ON public.reviews FOR INSERT
  WITH CHECK ( (auth.role() = 'authenticated' AND coalesce(approved,false) = false) OR public.is_admin() );

-- UPDATE/DELETE (onay/moderasyon) yalnız admin
DROP POLICY IF EXISTS rv_update_admin ON public.reviews;
CREATE POLICY rv_update_admin ON public.reviews FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS rv_delete_admin ON public.reviews;
CREATE POLICY rv_delete_admin ON public.reviews FOR DELETE USING (public.is_admin());

-- 7) Fonksiyon search_path (advisor: function_search_path_mutable) -----------
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
-- touch_site_pages varsa:
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='touch_site_pages') THEN
    EXECUTE 'ALTER FUNCTION public.touch_site_pages() SET search_path = public, pg_temp';
  END IF;
END $$;

-- Son teşhis: yeni politikalar
SELECT tablename, policyname, cmd, roles::text AS roles
FROM pg_policies
WHERE schemaname='public' AND tablename IN ('contact_messages','reviews')
ORDER BY tablename, cmd;
