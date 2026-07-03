-- ============================================================================
--  RE-SET · CANLI RLS TEŞHİSİ (SALT-OKUNUR — hiçbir şey değiştirmez)
--  Amaç: Düzeltme migration'ını uygulamadan ÖNCE canlı politika durumunu görmek.
--  Nasıl: Supabase Dashboard > SQL Editor'de çalıştır, çıktının TAMAMINI paylaş.
-- ============================================================================

-- 1) Tüm public tablolarında RLS açık mı? (rls_enabled = false olanlar TEHLİKE)
SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relrowsecurity ASC, c.relname;

-- 2) Tüm politikalar (kimin ne yapabildiği) — asıl kanıt burada
SELECT tablename, policyname, cmd, roles,
       qual        AS using_expr,
       with_check  AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 3) KRİTİK: user_metadata'ya güvenen (kullanıcı-yazılabilir) her politika
--    Burada satır dönerse = ayrıcalık yükseltme açığı CANLIDA demektir.
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual ILIKE '%user_metadata%' OR with_check ILIKE '%user_metadata%');

-- 4) WITH CHECK'i olmayan UPDATE politikaları (H1: self-escalation riski)
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND cmd IN ('UPDATE','ALL') AND with_check IS NULL;

-- 5) is_admin() fonksiyonunun canlı tanımı
SELECT p.proname, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('is_admin');

-- 6) users tablosunun gerçek kolonları (role/approved/user_id/password var mı?)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 7) clients tablosu — sahiplik hangi kolonla? (email mi user_id mi?)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clients'
ORDER BY ordinal_position;

-- 8) admin_emails tablosu var mı ve kimler admin? (parolaları değil, e-postaları)
SELECT to_regclass('public.admin_emails') AS admin_emails_table;
-- Tablo varsa: SELECT email FROM public.admin_emails;
