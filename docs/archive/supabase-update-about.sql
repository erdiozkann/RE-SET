-- Add story column to about_contents for full editable story
ALTER TABLE about_contents ADD COLUMN IF NOT EXISTS story text;

-- Add text_color column to about_contents for customization of hero text color
ALTER TABLE about_contents ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#1A1A1A';

-- Update existing records to have default values if needed
UPDATE about_contents SET text_color = '#1A1A1A' WHERE text_color IS NULL;

-- If you want to migrate existing paragraphs to story, you can run something like this (optional):
-- UPDATE about_contents SET story = 'Hayatımın büyük bir bölümünde, başkalarının beklentilerini karşılamaya odaklanmış, kendi iç sesimi duymakta zorlandığım bir dönem yaşadım. Kurumsal dünyada geçirdiğim yıllar boyunca başarılı görünürken, içimde derin bir boşluk hissediyordum.\n\nBu iç yolculuk, beni Demartini Metodu ve değer belirleme dünyasıyla tanıştırdı. Önce kendi hayatımı dönüştürdüm, sonra bu dönüşümün gücünü başkalarıyla paylaşma arzusu doğdu. Dr. John Demartini''den aldığım uluslararası sertifikalarımla ve sürekli eğitimlerle kendimi geliştirdim ve bugün buradayım.\n\n' || paragraph2 WHERE story IS NULL;
