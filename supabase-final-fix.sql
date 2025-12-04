-- ============================================
-- TÜM POLİCY'LERİ TEMİZLE VE YENİDEN OLUŞTUR
-- ============================================

-- Önce tüm allow_all policy'lerini sil
DROP POLICY IF EXISTS "allow_all" ON public.users;
DROP POLICY IF EXISTS "allow_all" ON public.clients;
DROP POLICY IF EXISTS "allow_all" ON public.services;
DROP POLICY IF EXISTS "allow_all" ON public.appointments;
DROP POLICY IF EXISTS "allow_all" ON public.progress_records;
DROP POLICY IF EXISTS "allow_all" ON public.client_resources;
DROP POLICY IF EXISTS "allow_all" ON public.methods;
DROP POLICY IF EXISTS "allow_all" ON public.reviews;
DROP POLICY IF EXISTS "allow_all" ON public.certificates;
DROP POLICY IF EXISTS "allow_all" ON public.working_config;
DROP POLICY IF EXISTS "allow_all" ON public.contact_info;
DROP POLICY IF EXISTS "allow_all" ON public.profile_images;
DROP POLICY IF EXISTS "allow_all" ON public.blog_posts;
DROP POLICY IF EXISTS "allow_all" ON public.podcast_episodes;
DROP POLICY IF EXISTS "allow_all" ON public.hero_contents;
DROP POLICY IF EXISTS "allow_all" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_all" ON public.about_contents;

-- USERS
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update users" ON public.users;
DROP POLICY IF EXISTS "Anyone can register" ON public.users;
DROP POLICY IF EXISTS "Users can delete own record" ON public.users;
DROP POLICY IF EXISTS "user_insert" ON public.users;
DROP POLICY IF EXISTS "user_select" ON public.users;
DROP POLICY IF EXISTS "user_update" ON public.users;
DROP POLICY IF EXISTS "users_insert_registration" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_allow_insert" ON public.users;
DROP POLICY IF EXISTS "users_allow_select" ON public.users;
DROP POLICY IF EXISTS "users_allow_update_own" ON public.users;
DROP POLICY IF EXISTS "users_allow_delete_own" ON public.users;
DROP POLICY IF EXISTS "users_allow_update" ON public.users;
DROP POLICY IF EXISTS "users_allow_delete" ON public.users;

-- SERVICES
DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "services_select" ON public.services;
DROP POLICY IF EXISTS "services_all" ON public.services;

-- HERO_CONTENTS
DROP POLICY IF EXISTS "Admin can manage hero_contents" ON public.hero_contents;
DROP POLICY IF EXISTS "Anyone can view hero_contents" ON public.hero_contents;
DROP POLICY IF EXISTS "hero_select" ON public.hero_contents;
DROP POLICY IF EXISTS "hero_all" ON public.hero_contents;

-- ABOUT_CONTENTS
DROP POLICY IF EXISTS "Admin can manage about_contents" ON public.about_contents;
DROP POLICY IF EXISTS "Anyone can view about_contents" ON public.about_contents;
DROP POLICY IF EXISTS "about_select" ON public.about_contents;
DROP POLICY IF EXISTS "about_all" ON public.about_contents;

-- CONTACT_INFO
DROP POLICY IF EXISTS "Admin can manage contact_info" ON public.contact_info;
DROP POLICY IF EXISTS "Anyone can view contact_info" ON public.contact_info;
DROP POLICY IF EXISTS "contact_info_select" ON public.contact_info;
DROP POLICY IF EXISTS "contact_info_all" ON public.contact_info;

-- CERTIFICATES
DROP POLICY IF EXISTS "Admin can manage certificates" ON public.certificates;
DROP POLICY IF EXISTS "Anyone can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "certificates_select" ON public.certificates;
DROP POLICY IF EXISTS "certificates_all" ON public.certificates;

-- METHODS
DROP POLICY IF EXISTS "Admin can manage methods" ON public.methods;
DROP POLICY IF EXISTS "Anyone can view methods" ON public.methods;
DROP POLICY IF EXISTS "methods_select" ON public.methods;
DROP POLICY IF EXISTS "methods_all" ON public.methods;

-- REVIEWS
DROP POLICY IF EXISTS "Admin can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can add reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_all" ON public.reviews;

-- BLOG_POSTS
DROP POLICY IF EXISTS "Admin can manage blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_select" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_all" ON public.blog_posts;

-- PODCAST_EPISODES
DROP POLICY IF EXISTS "Admin can manage podcast_episodes" ON public.podcast_episodes;
DROP POLICY IF EXISTS "Anyone can view podcast_episodes" ON public.podcast_episodes;
DROP POLICY IF EXISTS "podcast_select" ON public.podcast_episodes;
DROP POLICY IF EXISTS "podcast_all" ON public.podcast_episodes;

-- PROFILE_IMAGES
DROP POLICY IF EXISTS "Admin can manage profile_images" ON public.profile_images;
DROP POLICY IF EXISTS "Anyone can view profile_images" ON public.profile_images;
DROP POLICY IF EXISTS "profile_images_select" ON public.profile_images;
DROP POLICY IF EXISTS "profile_images_all" ON public.profile_images;
DROP POLICY IF EXISTS "allow_all" ON public.profile_images;

-- WORKING_CONFIG
DROP POLICY IF EXISTS "Admin can manage working_config" ON public.working_config;
DROP POLICY IF EXISTS "Anyone can view working_config" ON public.working_config;
DROP POLICY IF EXISTS "working_config_select" ON public.working_config;
DROP POLICY IF EXISTS "working_config_all" ON public.working_config;

-- CONTACT_MESSAGES
DROP POLICY IF EXISTS "Admin can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_all" ON public.contact_messages;

-- APPOINTMENTS
DROP POLICY IF EXISTS "Admin can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_all" ON public.appointments;

-- CLIENTS
DROP POLICY IF EXISTS "Admin can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Admin can view all clients" ON public.clients;
DROP POLICY IF EXISTS "clients_all" ON public.clients;

-- PROGRESS_RECORDS
DROP POLICY IF EXISTS "Admin can manage progress" ON public.progress_records;
DROP POLICY IF EXISTS "Admin can view all progress" ON public.progress_records;
DROP POLICY IF EXISTS "Clients can view own progress" ON public.progress_records;
DROP POLICY IF EXISTS "progress_all" ON public.progress_records;

-- CLIENT_RESOURCES
DROP POLICY IF EXISTS "Admin can manage resources" ON public.client_resources;
DROP POLICY IF EXISTS "Admin can view all resources" ON public.client_resources;
DROP POLICY IF EXISTS "Clients can view own resources" ON public.client_resources;
DROP POLICY IF EXISTS "resources_all" ON public.client_resources;

-- ============================================
-- RLS AKTİF ET
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_contents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASİT POLİCY'LER OLUŞTUR (Herkese açık)
-- ============================================
CREATE POLICY "allow_all" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.progress_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.client_resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.working_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.contact_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.profile_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.podcast_episodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.hero_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.about_contents FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- IMAGE SÜTUNLARI EKLE
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_contents' AND column_name = 'image') THEN
        ALTER TABLE hero_contents ADD COLUMN image TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'about_contents' AND column_name = 'image') THEN
        ALTER TABLE about_contents ADD COLUMN image TEXT;
    END IF;
END $$;

UPDATE about_contents SET image = 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg' WHERE image IS NULL;

-- ============================================
-- PROFILE_IMAGES VERİLERİNİ GÜNCELLE/EKLE
-- ============================================
-- Mevcut tabloyu kullan, sadece veri ekle/güncelle
INSERT INTO profile_images (name, url, location)
SELECT 'Hakkımda Resmi', 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg', 'about-hero'
WHERE NOT EXISTS (SELECT 1 FROM profile_images WHERE location = 'about-hero');

INSERT INTO profile_images (name, url, location)
SELECT 'Ana Sayfa Resmi', 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg', 'hero-main'
WHERE NOT EXISTS (SELECT 1 FROM profile_images WHERE location = 'hero-main');

SELECT 'Tamamlandı!' as status;
