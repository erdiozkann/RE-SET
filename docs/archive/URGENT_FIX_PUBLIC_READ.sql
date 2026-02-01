-- ================================================================
-- 🚨 ACİL: TÜM PUBLIC TABLOLAR İÇİN OKUMA İZNİ
-- ================================================================
-- Bu script site ziyaretçilerinin görmesi gereken tüm tabloları açar.
-- Supabase Dashboard > SQL Editor'de çalıştırın.
-- Tarih: 2026-01-30

BEGIN;

-- ============================================
-- 1. RLS'Yİ AKTİFLEŞTİR (Zaten aktif olabilir)
-- ============================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PUBLIC OKUMA POLİTİKALARI (Herkes görebilir)
-- ============================================

-- Services
DROP POLICY IF EXISTS "Public Read Services" ON public.services;
CREATE POLICY "Public Read Services" ON public.services
FOR SELECT TO anon, authenticated USING (true);

-- Methods
DROP POLICY IF EXISTS "Public Read Methods" ON public.methods;
CREATE POLICY "Public Read Methods" ON public.methods
FOR SELECT TO anon, authenticated USING (true);

-- About Contents
DROP POLICY IF EXISTS "Public Read About" ON public.about_contents;
CREATE POLICY "Public Read About" ON public.about_contents
FOR SELECT TO anon, authenticated USING (true);

-- Contact Info
DROP POLICY IF EXISTS "Public Read Contact" ON public.contact_info;
CREATE POLICY "Public Read Contact" ON public.contact_info
FOR SELECT TO anon, authenticated USING (true);

-- Blog Posts
DROP POLICY IF EXISTS "Public Read Blog" ON public.blog_posts;
CREATE POLICY "Public Read Blog" ON public.blog_posts
FOR SELECT TO anon, authenticated USING (true);

-- Podcast Episodes
DROP POLICY IF EXISTS "Public Read Podcast" ON public.podcast_episodes;
CREATE POLICY "Public Read Podcast" ON public.podcast_episodes
FOR SELECT TO anon, authenticated USING (true);

-- Reviews (Sadece onaylılar görünsün)
DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews
FOR SELECT TO anon, authenticated USING (approved = true);

-- Certificates
DROP POLICY IF EXISTS "Public Read Certificates" ON public.certificates;
CREATE POLICY "Public Read Certificates" ON public.certificates
FOR SELECT TO anon, authenticated USING (true);

-- Legal Contents (KVKK, Gizlilik vb.)
DROP POLICY IF EXISTS "Public Read Legal" ON public.legal_contents;
CREATE POLICY "Public Read Legal" ON public.legal_contents
FOR SELECT TO anon, authenticated USING (true);

-- Profile Images
DROP POLICY IF EXISTS "Public Read ProfileImages" ON public.profile_images;
CREATE POLICY "Public Read ProfileImages" ON public.profile_images
FOR SELECT TO anon, authenticated USING (true);

-- Working Config
DROP POLICY IF EXISTS "Public Read Config" ON public.working_config;
CREATE POLICY "Public Read Config" ON public.working_config
FOR SELECT TO anon, authenticated USING (true);

-- Hero Contents
DROP POLICY IF EXISTS "Public Read Hero" ON public.hero_contents;
CREATE POLICY "Public Read Hero" ON public.hero_contents
FOR SELECT TO anon, authenticated USING (true);

-- YouTube Videos (Sadece yayınlanmışlar)
DROP POLICY IF EXISTS "Public Read Youtube" ON public.youtube_videos;
CREATE POLICY "Public Read Youtube" ON public.youtube_videos
FOR SELECT TO anon, authenticated USING (is_published = true);

-- ============================================
-- 3. ADMIN YETKİLERİ (Admin her şeyi yapabilir)
-- ============================================

-- Admin check fonksiyonu
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('info@re-set.com.tr', 'admin@re-set.com.tr')
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Services Admin
DROP POLICY IF EXISTS "Admin All Services" ON public.services;
CREATE POLICY "Admin All Services" ON public.services
FOR ALL TO authenticated USING (public.is_admin());

-- Methods Admin
DROP POLICY IF EXISTS "Admin All Methods" ON public.methods;
CREATE POLICY "Admin All Methods" ON public.methods
FOR ALL TO authenticated USING (public.is_admin());

-- About Admin
DROP POLICY IF EXISTS "Admin All About" ON public.about_contents;
CREATE POLICY "Admin All About" ON public.about_contents
FOR ALL TO authenticated USING (public.is_admin());

-- Contact Admin
DROP POLICY IF EXISTS "Admin All Contact" ON public.contact_info;
CREATE POLICY "Admin All Contact" ON public.contact_info
FOR ALL TO authenticated USING (public.is_admin());

-- Blog Admin
DROP POLICY IF EXISTS "Admin All Blog" ON public.blog_posts;
CREATE POLICY "Admin All Blog" ON public.blog_posts
FOR ALL TO authenticated USING (public.is_admin());

-- Podcast Admin
DROP POLICY IF EXISTS "Admin All Podcast" ON public.podcast_episodes;
CREATE POLICY "Admin All Podcast" ON public.podcast_episodes
FOR ALL TO authenticated USING (public.is_admin());

-- Reviews Admin
DROP POLICY IF EXISTS "Admin All Reviews" ON public.reviews;
CREATE POLICY "Admin All Reviews" ON public.reviews
FOR ALL TO authenticated USING (public.is_admin());

-- Certificates Admin
DROP POLICY IF EXISTS "Admin All Certificates" ON public.certificates;
CREATE POLICY "Admin All Certificates" ON public.certificates
FOR ALL TO authenticated USING (public.is_admin());

-- Legal Admin
DROP POLICY IF EXISTS "Admin All Legal" ON public.legal_contents;
CREATE POLICY "Admin All Legal" ON public.legal_contents
FOR ALL TO authenticated USING (public.is_admin());

-- Profile Images Admin
DROP POLICY IF EXISTS "Admin All ProfileImages" ON public.profile_images;
CREATE POLICY "Admin All ProfileImages" ON public.profile_images
FOR ALL TO authenticated USING (public.is_admin());

-- Working Config Admin
DROP POLICY IF EXISTS "Admin All Config" ON public.working_config;
CREATE POLICY "Admin All Config" ON public.working_config
FOR ALL TO authenticated USING (public.is_admin());

-- Hero Admin
DROP POLICY IF EXISTS "Admin All Hero" ON public.hero_contents;
CREATE POLICY "Admin All Hero" ON public.hero_contents
FOR ALL TO authenticated USING (public.is_admin());

-- YouTube Admin
DROP POLICY IF EXISTS "Admin All Youtube" ON public.youtube_videos;
CREATE POLICY "Admin All Youtube" ON public.youtube_videos
FOR ALL TO authenticated USING (public.is_admin());

-- ============================================
-- 4. STORAGE BUCKET İZİNLERİ
-- ============================================
UPDATE storage.buckets SET public = true
WHERE id IN ('hero-images', 'profile-images', 'content-images');

-- Storage okuma izni
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id IN ('hero-images', 'profile-images', 'content-images'));

-- ============================================
-- 5. GRANT İZİNLERİ
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

COMMIT;

-- Doğrulama
SELECT 'services' as tablo, count(*) as kayit FROM public.services
UNION ALL SELECT 'methods', count(*) FROM public.methods
UNION ALL SELECT 'about_contents', count(*) FROM public.about_contents
UNION ALL SELECT 'contact_info', count(*) FROM public.contact_info
UNION ALL SELECT 'hero_contents', count(*) FROM public.hero_contents
UNION ALL SELECT 'blog_posts', count(*) FROM public.blog_posts;
