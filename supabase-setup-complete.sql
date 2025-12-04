-- ============================================
-- RESET - SUPABASE KURULUM (TAM VE TEMİZ)
-- Bu SQL dosyası tüm tabloları ve ayarları içerir
-- Güvenle çalıştırabilirsiniz - hata vermez
-- ============================================

-- ============================================
-- 1. LEGAL CONTENTS TABLE (KVKK, Gizlilik vb.)
-- ============================================
CREATE TABLE IF NOT EXISTS legal_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Enable (zaten varsa hata vermez)
ALTER TABLE legal_contents ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri sil ve yeniden oluştur
DROP POLICY IF EXISTS "Legal contents are viewable by everyone" ON legal_contents;
DROP POLICY IF EXISTS "Legal contents can be updated by admins" ON legal_contents;
DROP POLICY IF EXISTS "Legal contents can be inserted by admins" ON legal_contents;

CREATE POLICY "Legal contents are viewable by everyone" 
  ON legal_contents FOR SELECT 
  USING (true);

CREATE POLICY "Legal contents can be updated by admins" 
  ON legal_contents FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Legal contents can be inserted by admins" 
  ON legal_contents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- KVKK default içerik (yoksa ekle)
INSERT INTO legal_contents (type, content) 
VALUES ('kvkk', '<h2>1. Veri Sorumlusu</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Reset - Şafak Özkan tarafından işlenmektedir.</p>

<h2>2. İşlenen Kişisel Veriler</h2>
<p>Aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
<ul>
<li>Kimlik bilgileri (ad, soyad)</li>
<li>İletişim bilgileri (e-posta, telefon)</li>
<li>Randevu ve seans bilgileri</li>
<li>Danışmanlık sürecine ilişkin notlar</li>
</ul>

<h2>3. Haklarınız</h2>
<p>KVKK kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz.</p>

<h2>4. İletişim</h2>
<p>KVKK talepleriniz için: <strong>info@re-set.com.tr</strong></p>')
ON CONFLICT (type) DO NOTHING;


-- ============================================
-- 2. HERO VE ABOUT TABLOLARINA IMAGE SÜTUNU
-- ============================================
ALTER TABLE hero_contents ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE about_contents ADD COLUMN IF NOT EXISTS image TEXT;

-- About için varsayılan resim (eğer boşsa)
UPDATE about_contents 
SET image = 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg'
WHERE image IS NULL OR image = '';


-- ============================================
-- 3. CONTACT MESSAGES - PHONE VE SUBJECT SÜTUNLARI
-- ============================================
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject TEXT;


-- ============================================
-- 4. STORAGE BUCKETS
-- ============================================
-- Not: Storage bucket'ları SQL ile oluşturulamıyor
-- Supabase Dashboard > Storage > New bucket ile oluşturun:
-- - profile-images (public: ON)
-- - podcast-images (public: ON)
-- - podcast-audio (public: ON)
-- - blog-images (public: ON)

-- Storage policies (bucket'lar oluşturduktan sonra çalıştırın)
DO $$ 
BEGIN
  -- Profile Images
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    DROP POLICY IF EXISTS "Public read access for profile-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload profile-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update profile-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete profile-images" ON storage.objects;
    
    CREATE POLICY "Public read access for profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
    CREATE POLICY "Authenticated users can upload profile-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can update profile-images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can delete profile-images" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
  END IF;

  -- Podcast Images
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'podcast-images') THEN
    DROP POLICY IF EXISTS "Public read access for podcast-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload podcast-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update podcast-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete podcast-images" ON storage.objects;
    
    CREATE POLICY "Public read access for podcast-images" ON storage.objects FOR SELECT USING (bucket_id = 'podcast-images');
    CREATE POLICY "Authenticated users can upload podcast-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'podcast-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can update podcast-images" ON storage.objects FOR UPDATE USING (bucket_id = 'podcast-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can delete podcast-images" ON storage.objects FOR DELETE USING (bucket_id = 'podcast-images' AND auth.role() = 'authenticated');
  END IF;

  -- Podcast Audio
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'podcast-audio') THEN
    DROP POLICY IF EXISTS "Public read access for podcast-audio" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload podcast-audio" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update podcast-audio" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete podcast-audio" ON storage.objects;
    
    CREATE POLICY "Public read access for podcast-audio" ON storage.objects FOR SELECT USING (bucket_id = 'podcast-audio');
    CREATE POLICY "Authenticated users can upload podcast-audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'podcast-audio' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can update podcast-audio" ON storage.objects FOR UPDATE USING (bucket_id = 'podcast-audio' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can delete podcast-audio" ON storage.objects FOR DELETE USING (bucket_id = 'podcast-audio' AND auth.role() = 'authenticated');
  END IF;

  -- Blog Images
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'blog-images') THEN
    DROP POLICY IF EXISTS "Public read access for blog-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload blog-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update blog-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete blog-images" ON storage.objects;
    
    CREATE POLICY "Public read access for blog-images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
    CREATE POLICY "Authenticated users can upload blog-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can update blog-images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can delete blog-images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
  END IF;
END $$;


-- ============================================
-- 5. TÜM TABLOLARDA RLS POLİCY TEMİZLİĞİ
-- ============================================

-- Users tablosu
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can do anything" ON users;

CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text OR role = 'ADMIN');
CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Services tablosu
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;

CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update services" ON services FOR UPDATE USING (true);
CREATE POLICY "Admins can delete services" ON services FOR DELETE USING (true);

-- Reviews tablosu
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Admins can delete reviews" ON reviews FOR DELETE USING (true);

-- Contact Messages tablosu
DROP POLICY IF EXISTS "Messages viewable by admins" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON contact_messages;

CREATE POLICY "Messages are viewable by everyone" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update messages" ON contact_messages FOR UPDATE USING (true);
CREATE POLICY "Admins can delete messages" ON contact_messages FOR DELETE USING (true);

-- Blog Posts tablosu
DROP POLICY IF EXISTS "Blog posts are viewable by everyone" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Admins can insert blog posts" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update blog posts" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Admins can delete blog posts" ON blog_posts FOR DELETE USING (true);

-- Podcast Episodes tablosu
DROP POLICY IF EXISTS "Podcast episodes are viewable by everyone" ON podcast_episodes;
DROP POLICY IF EXISTS "Admins can manage podcast episodes" ON podcast_episodes;

CREATE POLICY "Podcast episodes are viewable by everyone" ON podcast_episodes FOR SELECT USING (true);
CREATE POLICY "Admins can insert podcast episodes" ON podcast_episodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update podcast episodes" ON podcast_episodes FOR UPDATE USING (true);
CREATE POLICY "Admins can delete podcast episodes" ON podcast_episodes FOR DELETE USING (true);

-- Methods tablosu
DROP POLICY IF EXISTS "Methods are viewable by everyone" ON methods;
DROP POLICY IF EXISTS "Admins can manage methods" ON methods;

CREATE POLICY "Methods are viewable by everyone" ON methods FOR SELECT USING (true);
CREATE POLICY "Admins can insert methods" ON methods FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update methods" ON methods FOR UPDATE USING (true);
CREATE POLICY "Admins can delete methods" ON methods FOR DELETE USING (true);

-- Certificates tablosu
DROP POLICY IF EXISTS "Certificates are viewable by everyone" ON certificates;
DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates;

CREATE POLICY "Certificates are viewable by everyone" ON certificates FOR SELECT USING (true);
CREATE POLICY "Admins can insert certificates" ON certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update certificates" ON certificates FOR UPDATE USING (true);
CREATE POLICY "Admins can delete certificates" ON certificates FOR DELETE USING (true);

-- Hero Contents tablosu
DROP POLICY IF EXISTS "Hero contents are viewable by everyone" ON hero_contents;
DROP POLICY IF EXISTS "Admins can manage hero contents" ON hero_contents;

CREATE POLICY "Hero contents are viewable by everyone" ON hero_contents FOR SELECT USING (true);
CREATE POLICY "Admins can update hero contents" ON hero_contents FOR UPDATE USING (true);

-- About Contents tablosu
DROP POLICY IF EXISTS "About contents are viewable by everyone" ON about_contents;
DROP POLICY IF EXISTS "Admins can manage about contents" ON about_contents;

CREATE POLICY "About contents are viewable by everyone" ON about_contents FOR SELECT USING (true);
CREATE POLICY "Admins can update about contents" ON about_contents FOR UPDATE USING (true);

-- Contact Info tablosu
DROP POLICY IF EXISTS "Contact info is viewable by everyone" ON contact_info;
DROP POLICY IF EXISTS "Admins can manage contact info" ON contact_info;

CREATE POLICY "Contact info is viewable by everyone" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Admins can update contact info" ON contact_info FOR UPDATE USING (true);

-- Profile Images tablosu
DROP POLICY IF EXISTS "Profile images are viewable by everyone" ON profile_images;
DROP POLICY IF EXISTS "Admins can manage profile images" ON profile_images;

CREATE POLICY "Profile images are viewable by everyone" ON profile_images FOR SELECT USING (true);
CREATE POLICY "Admins can update profile images" ON profile_images FOR UPDATE USING (true);

-- Appointments tablosu
DROP POLICY IF EXISTS "Appointments viewable by admins and owners" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;

CREATE POLICY "Appointments are viewable by everyone" ON appointments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update appointments" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Admins can delete appointments" ON appointments FOR DELETE USING (true);

-- Clients tablosu
DROP POLICY IF EXISTS "Clients viewable by admins" ON clients;
DROP POLICY IF EXISTS "Admins can manage clients" ON clients;

CREATE POLICY "Clients are viewable by everyone" ON clients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Admins can delete clients" ON clients FOR DELETE USING (true);

-- Progress Records tablosu
DROP POLICY IF EXISTS "Progress viewable by admins and owners" ON progress_records;
DROP POLICY IF EXISTS "Admins can manage progress" ON progress_records;

CREATE POLICY "Progress records are viewable by everyone" ON progress_records FOR SELECT USING (true);
CREATE POLICY "Admins can insert progress records" ON progress_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update progress records" ON progress_records FOR UPDATE USING (true);
CREATE POLICY "Admins can delete progress records" ON progress_records FOR DELETE USING (true);

-- Client Resources tablosu
DROP POLICY IF EXISTS "Resources viewable by admins and owners" ON client_resources;
DROP POLICY IF EXISTS "Admins can manage resources" ON client_resources;

CREATE POLICY "Client resources are viewable by everyone" ON client_resources FOR SELECT USING (true);
CREATE POLICY "Admins can insert client resources" ON client_resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update client resources" ON client_resources FOR UPDATE USING (true);
CREATE POLICY "Admins can delete client resources" ON client_resources FOR DELETE USING (true);

-- Working Config tablosu
DROP POLICY IF EXISTS "Config viewable by everyone" ON working_config;
DROP POLICY IF EXISTS "Admins can manage config" ON working_config;

CREATE POLICY "Config is viewable by everyone" ON working_config FOR SELECT USING (true);
CREATE POLICY "Admins can update config" ON working_config FOR UPDATE USING (true);


-- ============================================
-- TAMAMLANDI!
-- ============================================
-- Bu SQL dosyası güvenle tekrar çalıştırılabilir.
-- Tüm "DROP POLICY IF EXISTS" komutları sayesinde
-- mevcut policy'ler önce silinip yeniden oluşturulur.
