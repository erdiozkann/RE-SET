-- ============================================
-- HIZLI FIX - IMAGE SÜTUNLARI EKLE
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- ============================================

-- Hero tablosuna image sütunu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hero_contents' AND column_name = 'image'
    ) THEN
        ALTER TABLE hero_contents ADD COLUMN image TEXT;
    END IF;
END $$;

-- About tablosuna image sütunu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_contents' AND column_name = 'image'
    ) THEN
        ALTER TABLE about_contents ADD COLUMN image TEXT;
    END IF;
END $$;

-- About için varsayılan resim ayarla
UPDATE about_contents 
SET image = 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg'
WHERE image IS NULL;

-- Kontrol et
SELECT 'hero_contents' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hero_contents' AND column_name = 'image'
UNION ALL
SELECT 'about_contents' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'about_contents' AND column_name = 'image';
