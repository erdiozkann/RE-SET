-- Progress Records - Constraint Düzeltme Script'i
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- 0-100 aralığındaki değerleri kabul edecek şekilde günceller

-- Adım 1: Mevcut tüm constraint'leri listele ve kaydet
DO $$ 
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '=== Mevcut Constraint''ler ===';
    FOR r IN (
        SELECT conname, pg_get_constraintdef(oid) as def
        FROM pg_constraint
        WHERE conrelid = 'progress_records'::regclass
          AND contype = 'c'
          AND (conname LIKE '%emotional%' OR conname LIKE '%mental%' OR conname LIKE '%centeredness%')
    ) LOOP
        RAISE NOTICE 'Constraint: % => %', r.conname, r.def;
    END LOOP;
END $$;

-- Adım 2: Tüm progress metrik constraint'lerini kaldır
DO $$ 
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '=== Constraint''ler Kaldırılıyor ===';
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'progress_records'::regclass
          AND contype = 'c'
          AND (conname LIKE '%emotional%' OR conname LIKE '%mental%' OR conname LIKE '%centeredness%')
    ) LOOP
        EXECUTE format('ALTER TABLE progress_records DROP CONSTRAINT %I', r.conname);
        RAISE NOTICE 'Kaldırıldı: %', r.conname;
    END LOOP;
END $$;

-- Adım 3: Yeni 0-100 constraint'leri ekle
ALTER TABLE progress_records
  ADD CONSTRAINT progress_emotional_clarity_range CHECK (
    emotional_clarity IS NULL OR (emotional_clarity >= 0 AND emotional_clarity <= 100)
  ),
  ADD CONSTRAINT progress_mental_clarity_range CHECK (
    mental_clarity IS NULL OR (mental_clarity >= 0 AND mental_clarity <= 100)
  ),
  ADD CONSTRAINT progress_centeredness_range CHECK (
    centeredness IS NULL OR (centeredness >= 0 AND centeredness <= 100)
  );

-- Adım 4: Değişiklikleri doğrula
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'progress_records'::regclass
  AND contype = 'c'
  AND (conname LIKE '%emotional%' OR conname LIKE '%mental%' OR conname LIKE '%centeredness%')
ORDER BY conname;

-- Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE '✅ Progress records constraint''leri 0-100 aralığına güncellendi!';
    RAISE NOTICE 'Artık 43 gibi değerler kaydedilebilir.';
END $$;
