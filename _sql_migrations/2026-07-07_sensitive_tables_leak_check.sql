-- RE-SET — Hassas tablolarda PUBLIC OKUMA SIZINTISI teşhisi (salt-okuma)
-- "İçerik tablolarında yalnız SELECT var" bulgusu, hassas tablolarda da aynı
-- desenin olabileceğini düşündürüyor. Eğer bu tablolarda SELECT politikası
-- anon/public'e açıksa → danışan PII'si, randevular, mesajlar, finans HERKESE açık.
-- Bu dosya HİÇBİR ŞEY DEĞİŞTİRMEZ; sadece durumu raporlar. SQL Editor'de çalıştır.

-- Hangi hassas tablolarda hangi rol için SELECT politikası var + koşulu ne?
--   roles içinde {anon} veya {public} görünen ve qual='true' (ya da null) olan
--   satırlar SIZINTIDIR → anon herkes okuyabiliyor demektir.
SELECT
  p.tablename,
  p.policyname,
  p.cmd,
  p.roles::text            AS roller,
  p.qual                   AS using_kosulu,
  CASE
    WHEN p.cmd IN ('SELECT','ALL')
     AND (p.roles::text LIKE '%anon%' OR p.roles::text LIKE '%public%')
     AND (p.qual IS NULL OR btrim(p.qual) IN ('true','(true)'))
    THEN '⚠️ ANON HERKES OKUYABİLİR — SIZINTI'
    ELSE 'ok'
  END AS degerlendirme
FROM pg_policies p
WHERE p.schemaname = 'public'
  AND p.tablename = ANY (ARRAY[
    'clients','appointments','progress_records','progress_metrics',
    'client_resources','contact_messages','users',
    'ad_accounts','ad_campaigns','ad_conversions','ad_metrics','ad_roi_summary'
  ])
ORDER BY p.tablename, p.cmd;

-- Ek: bu tablolarda RLS açık mı? (kapalıysa politika olsun olmasın herkes okur/yazar)
SELECT c.relname AS tablo, c.relrowsecurity AS rls_acik
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public'
  AND c.relname = ANY (ARRAY[
    'clients','appointments','progress_records','progress_metrics',
    'client_resources','contact_messages','users',
    'ad_accounts','ad_campaigns','ad_conversions','ad_metrics','ad_roi_summary'
  ])
ORDER BY c.relname;
