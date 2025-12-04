-- LinkedIn sütununu YouTube ile değiştir

-- Önce yeni youtube sütunu ekle
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS youtube TEXT;

-- Eğer linkedin verisi varsa youtube'a kopyala (opsiyonel)
-- UPDATE contact_info SET youtube = linkedin WHERE linkedin IS NOT NULL;

-- LinkedIn sütununu kaldır
ALTER TABLE contact_info DROP COLUMN IF EXISTS linkedin;
