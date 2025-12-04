-- Users tablosuna phone sütunu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Sütunun eklendiğini kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
 