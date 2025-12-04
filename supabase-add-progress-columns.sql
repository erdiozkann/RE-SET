-- Progress Records tablosuna eksik kolonları ekle
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Yeni kolonları ekle (varsa hata vermez)
DO $$ 
BEGIN
    -- emotional_clarity kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'progress_records' AND column_name = 'emotional_clarity') THEN
    ALTER TABLE progress_records ADD COLUMN emotional_clarity INTEGER CHECK (emotional_clarity >= 0 AND emotional_clarity <= 100);
    END IF;
    
    -- mental_clarity kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'progress_records' AND column_name = 'mental_clarity') THEN
    ALTER TABLE progress_records ADD COLUMN mental_clarity INTEGER CHECK (mental_clarity >= 0 AND mental_clarity <= 100);
    END IF;
    
    -- centeredness kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'progress_records' AND column_name = 'centeredness') THEN
    ALTER TABLE progress_records ADD COLUMN centeredness INTEGER CHECK (centeredness >= 0 AND centeredness <= 100);
    END IF;
    
    -- summary kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'progress_records' AND column_name = 'summary') THEN
        ALTER TABLE progress_records ADD COLUMN summary TEXT;
    END IF;
    
    RAISE NOTICE 'Progress records kolonları başarıyla eklendi/kontrol edildi.';
END $$;

-- Tabloyu görüntüle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'progress_records'
ORDER BY ordinal_position;
