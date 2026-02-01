-- 1. EKSİK KOLONLARI EKLE (Schema Repair)
DO $$
BEGIN
    -- Blog Posts: category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'category') THEN
        ALTER TABLE public.blog_posts ADD COLUMN category text DEFAULT 'Genel';
    END IF;

    -- Blog Posts: read_time
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'read_time') THEN
        ALTER TABLE public.blog_posts ADD COLUMN read_time text DEFAULT '5 dk';
    END IF;

    -- Blog Posts: featured
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'featured') THEN
        ALTER TABLE public.blog_posts ADD COLUMN featured boolean DEFAULT false;
    END IF;

    -- Blog Posts: author (opsiyonel ama iyi olur)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'author') THEN
        ALTER TABLE public.blog_posts ADD COLUMN author text DEFAULT 'Şafak Özkan';
    END IF;
END $$;

-- 2. MEVCUT VERİLERİ TEMİZLE VE YENİDEN EKLE (Seeding)

-- Hakkımda
DELETE FROM public.about_contents;
INSERT INTO public.about_contents (title, paragraph1, paragraph2, story, location, text_color, image)
VALUES (
  'Şafak Özkan',
  '15 yılı aşkın deneyimle binlerce kişinin hayatına dokundum. Demartini Metodu, değer belirleme ve Breakthrough Experience alanlarındaki uzmanlığımla size de kendi potansiyelinizi keşfetmenizde yardımcı oluyorum.',
  'Artık biliyorum ki, gerçek değişim içeriden başlar. Her bireyin kendine özgü bir potansiyeli vardır ve bu potansiyeli ortaya çıkarmak için sadece doğru rehberliğe ve içsel farkındalığa ihtiyaç vardır.',
  'Hayatımın büyük bir bölümünde, başkalarının beklentilerini karşılamaya odaklanmış, kendi iç sesimi duymakta zorlandığım bir dönem yaşadım.\n\nBu iç yolculuk, beni Demartini Metodu ve değer belirleme dünyasıyla tanıştırdı. Önce kendi hayatımı dönüştürdüm, sonra bu dönüşümün gücünü başkalarıyla paylaşma arzusu doğdu.',
  'istanbul',
  '#1A1A1A',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200'
);

-- Sertifikalar
DELETE FROM public.certificates;
INSERT INTO public.certificates (title, organization, year)
VALUES 
('Demartini Method Facilitator', 'Demartini Institute', '2023'),
('Values Factor Specialist', 'Demartini Institute', '2022'),
('Breakthrough Experience Graduate', 'Demartini Institute', '2021');

-- Yöntemler
DELETE FROM public.methods;
INSERT INTO public.methods (title, description, icon, details)
VALUES 
('Demartini Metodu', 'Değerlerinizi keşfetmenize ve yaşamınızı dengelemenize yardımcı olan dönüştürücü bir yöntem.', 'ri-brain-line', 'Bilişsel dengesizlikleri nötralize ederek, algılarınızı ve duygularınızı yönetmenizi sağlar.'),
('Breakthrough Experience', 'Kendi potansiyelinizi ortaya çıkarmak için engelleri kaldırmanıza odaklanır.', 'ri-flight-takeoff-line', 'Korkularınızı, yargılarınızı ve suçluluk duygularınızı aşmanız için tasarlanmıştır.'),
('Değer Belirleme', 'Hayatınızdaki en yüksek öncelikleri belirleyerek stratejik bir yaşam planı oluşturma.', 'ri-compass-3-line', 'Odaklanma ve verimlilik sorunlarını çözerek, ilham verici bir yaşam sürmenize yardımcı olur.');

-- Blog Yazıları
DELETE FROM public.blog_posts;
INSERT INTO public.blog_posts (title, excerpt, content, category, image, date, read_time, featured)
VALUES 
('Bilinç Seviyeleri ve Farkındalık', 'İçsel yolculuğumuzda farkındalığımızı nasıl artırabiliriz?', 'Bilinç seviyeleri, insanın kendini ve evreni anlama kapasitesini belirler...', 'Kişisel Gelişim', 'https://images.unsplash.com/photo-1518531933037-9a82bf55f045?q=80&w=800', '2025-12-01', '5 dk', true),
('Demartini Metodu ile Dengeyi Bulmak', 'Hayatın zıtlıklarını kucaklayarak nasıl dengeye ulaşırız?', 'Her olayda hem pozitif hem de negatif yönler vardır. Denge, bu iki kutbu aynı anda görebilmektir...', 'Demartini Metodu', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800', '2025-11-20', '7 dk', true);

-- Hero (Giriş)
DELETE FROM public.hero_contents;
INSERT INTO public.hero_contents (title, description, title_size, description_size, image, text_color)
VALUES ('Potansiyelinizi Keşfedin', 'Demartini Metodu ile zihinsel engelleri aşın ve gerçek gücünüzü ortaya çıkarın.', 'text-5xl md:text-6xl', 'text-xl', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200', '#1A1A1A');

-- İletişim Bilgileri
DELETE FROM public.contact_info;
INSERT INTO public.contact_info (email, phone, address, instagram, youtube)
VALUES ('info@re-set.com.tr', '+90 555 123 45 67', 'Nişantaşı, Şişli / İstanbul', 'https://instagram.com/safakozkan', 'https://youtube.com/@safakozkan');

-- Profil Resimleri
DELETE FROM public.profile_images;
INSERT INTO public.profile_images (name, url, location)
VALUES 
('Ana Sayfa Hero', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200', 'home-hero'),
('Hakkımda Profil', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1200', 'about-hero');
