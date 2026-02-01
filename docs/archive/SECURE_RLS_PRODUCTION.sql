-- ================================================================
-- 🛡️ PRODUCTION-GRADE SECURE RLS POLICIES
-- ================================================================
-- Senior Security Review: 2026-01-30
-- Fix: Column validation removed (app-level validation preferred)
--
-- KURULUM: Supabase Dashboard > SQL Editor'de çalıştırın.
-- ================================================================

BEGIN;

-- ============================================
-- 0. GÜVENLİK TABLOSU (Admin listesi için)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

INSERT INTO public.admin_emails (email)
VALUES ('info@re-set.com.tr'), ('admin@re-set.com.tr')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. GÜVENLİ HELPER FONKSİYONLARI
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
    user_email TEXT;
    user_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT email INTO user_email
    FROM auth.users
    WHERE id = auth.uid();

    IF EXISTS (SELECT 1 FROM public.admin_emails WHERE email = user_email) THEN
        RETURN TRUE;
    END IF;

    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid();

    RETURN COALESCE(user_role = 'ADMIN', FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
STABLE
AS $$
    SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- ============================================
-- 2. TÜM TABLOLARDA RLS'Yİ ETKİNLEŞTİR
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'users', 'clients', 'services', 'appointments', 'reviews',
        'contact_messages', 'blog_posts', 'podcast_episodes', 'methods',
        'certificates', 'progress_records', 'client_resources', 'invoices',
        'payments', 'working_config', 'hero_contents', 'about_contents',
        'contact_info', 'profile_images', 'legal_contents', 'ad_accounts',
        'ad_campaigns', 'youtube_videos'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        END IF;
    END LOOP;
END $$;

-- ============================================
-- 3. PUBLIC READ POLİTİKALARI (Site içeriği)
-- ============================================

-- Services
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "services_admin_all" ON public.services;
CREATE POLICY "services_admin_all" ON public.services
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Methods
DROP POLICY IF EXISTS "methods_public_read" ON public.methods;
CREATE POLICY "methods_public_read" ON public.methods
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "methods_admin_all" ON public.methods;
CREATE POLICY "methods_admin_all" ON public.methods
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blog Posts
DROP POLICY IF EXISTS "blog_public_read" ON public.blog_posts;
CREATE POLICY "blog_public_read" ON public.blog_posts
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "blog_admin_all" ON public.blog_posts;
CREATE POLICY "blog_admin_all" ON public.blog_posts
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Podcast Episodes
DROP POLICY IF EXISTS "podcast_public_read" ON public.podcast_episodes;
CREATE POLICY "podcast_public_read" ON public.podcast_episodes
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "podcast_admin_all" ON public.podcast_episodes;
CREATE POLICY "podcast_admin_all" ON public.podcast_episodes
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- YouTube Videos (sadece yayınlanmışlar)
DROP POLICY IF EXISTS "youtube_public_read" ON public.youtube_videos;
DROP POLICY IF EXISTS "youtube_admin_all" ON public.youtube_videos;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'youtube_videos' AND column_name = 'is_published') THEN
        CREATE POLICY "youtube_public_read" ON public.youtube_videos
            FOR SELECT TO anon, authenticated USING (is_published = true);
    ELSE
        CREATE POLICY "youtube_public_read" ON public.youtube_videos
            FOR SELECT TO anon, authenticated USING (true);
    END IF;
    CREATE POLICY "youtube_admin_all" ON public.youtube_videos
        FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;

-- Hero Contents
DROP POLICY IF EXISTS "hero_public_read" ON public.hero_contents;
CREATE POLICY "hero_public_read" ON public.hero_contents
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "hero_admin_all" ON public.hero_contents;
CREATE POLICY "hero_admin_all" ON public.hero_contents
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- About Contents
DROP POLICY IF EXISTS "about_public_read" ON public.about_contents;
CREATE POLICY "about_public_read" ON public.about_contents
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "about_admin_all" ON public.about_contents;
CREATE POLICY "about_admin_all" ON public.about_contents
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Contact Info
DROP POLICY IF EXISTS "contact_info_public_read" ON public.contact_info;
CREATE POLICY "contact_info_public_read" ON public.contact_info
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "contact_info_admin_all" ON public.contact_info;
CREATE POLICY "contact_info_admin_all" ON public.contact_info
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Certificates
DROP POLICY IF EXISTS "certificates_public_read" ON public.certificates;
CREATE POLICY "certificates_public_read" ON public.certificates
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "certificates_admin_all" ON public.certificates;
CREATE POLICY "certificates_admin_all" ON public.certificates
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Legal Contents
DROP POLICY IF EXISTS "legal_public_read" ON public.legal_contents;
CREATE POLICY "legal_public_read" ON public.legal_contents
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "legal_admin_all" ON public.legal_contents;
CREATE POLICY "legal_admin_all" ON public.legal_contents
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profile Images
DROP POLICY IF EXISTS "profile_images_public_read" ON public.profile_images;
CREATE POLICY "profile_images_public_read" ON public.profile_images
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profile_images_admin_all" ON public.profile_images;
CREATE POLICY "profile_images_admin_all" ON public.profile_images
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Working Config
DROP POLICY IF EXISTS "config_public_read" ON public.working_config;
CREATE POLICY "config_public_read" ON public.working_config
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "config_admin_all" ON public.working_config;
CREATE POLICY "config_admin_all" ON public.working_config
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- 4. REVIEWS (Basitleştirilmiş - App validation)
-- ============================================

DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_public_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;

-- Sadece onaylı yorumlar görünsün
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'approved') THEN
        CREATE POLICY "reviews_public_read" ON public.reviews
            FOR SELECT TO anon, authenticated USING (approved = true);
        -- Insert: approved=false ile başlamalı
        CREATE POLICY "reviews_public_insert" ON public.reviews
            FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
    ELSE
        CREATE POLICY "reviews_public_read" ON public.reviews
            FOR SELECT TO anon, authenticated USING (true);
        CREATE POLICY "reviews_public_insert" ON public.reviews
            FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
END $$;

CREATE POLICY "reviews_admin_all" ON public.reviews
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- 5. CONTACT MESSAGES (Basitleştirilmiş)
-- ============================================

DROP POLICY IF EXISTS "messages_admin_read" ON public.contact_messages;
CREATE POLICY "messages_admin_read" ON public.contact_messages
    FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "messages_public_insert" ON public.contact_messages;
CREATE POLICY "messages_public_insert" ON public.contact_messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "messages_admin_manage" ON public.contact_messages;
CREATE POLICY "messages_admin_manage" ON public.contact_messages
    FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "messages_admin_delete" ON public.contact_messages;
CREATE POLICY "messages_admin_delete" ON public.contact_messages
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================
-- 6. APPOINTMENTS
-- ============================================

DROP POLICY IF EXISTS "appointments_admin_all" ON public.appointments;
CREATE POLICY "appointments_admin_all" ON public.appointments
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "appointments_own_read" ON public.appointments;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_email') THEN
        CREATE POLICY "appointments_own_read" ON public.appointments
            FOR SELECT TO authenticated USING (client_email = public.get_my_email());
    END IF;
END $$;

DROP POLICY IF EXISTS "appointments_public_insert" ON public.appointments;
CREATE POLICY "appointments_public_insert" ON public.appointments
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================
-- 7. USERS - PRİVİLEGE ESCALATION KORUMASI
-- ============================================

DROP POLICY IF EXISTS "users_own_read" ON public.users;
CREATE POLICY "users_own_read" ON public.users
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_own_update" ON public.users;
CREATE POLICY "users_own_update" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.users WHERE id = auth.uid())
        AND id = auth.uid()
    );

DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- 8. PRIVATE TABLOLAR (SADECE ADMİN)
-- ============================================

DROP POLICY IF EXISTS "clients_admin_only" ON public.clients;
CREATE POLICY "clients_admin_only" ON public.clients
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "invoices_admin_only" ON public.invoices;
CREATE POLICY "invoices_admin_only" ON public.invoices
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "payments_admin_only" ON public.payments;
CREATE POLICY "payments_admin_only" ON public.payments
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ad_accounts_admin_only" ON public.ad_accounts;
CREATE POLICY "ad_accounts_admin_only" ON public.ad_accounts
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ad_campaigns_admin_only" ON public.ad_campaigns;
CREATE POLICY "ad_campaigns_admin_only" ON public.ad_campaigns
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================
-- 9. CLIENT PORTAL
-- ============================================

DROP POLICY IF EXISTS "progress_admin_all" ON public.progress_records;
CREATE POLICY "progress_admin_all" ON public.progress_records
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "progress_client_read" ON public.progress_records;
CREATE POLICY "progress_client_read" ON public.progress_records
    FOR SELECT TO authenticated
    USING (
        client_id IN (SELECT c.id FROM public.clients c WHERE c.email = public.get_my_email())
    );

DROP POLICY IF EXISTS "resources_admin_all" ON public.client_resources;
CREATE POLICY "resources_admin_all" ON public.client_resources
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "resources_client_read" ON public.client_resources;
CREATE POLICY "resources_client_read" ON public.client_resources
    FOR SELECT TO authenticated
    USING (
        client_id IN (SELECT c.id FROM public.clients c WHERE c.email = public.get_my_email())
    );

-- ============================================
-- 10. STORAGE GÜVENLİĞİ
-- ============================================

UPDATE storage.buckets SET public = true
WHERE id IN ('hero-images', 'profile-images', 'content-images');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('hero-images', 'hero-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('profile-images', 'profile-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('content-images', 'content-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id IN ('hero-images', 'profile-images', 'content-images'));

DROP POLICY IF EXISTS "storage_admin_insert" ON storage.objects;
CREATE POLICY "storage_admin_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('hero-images', 'profile-images', 'content-images') AND public.is_admin());

DROP POLICY IF EXISTS "storage_admin_update" ON storage.objects;
CREATE POLICY "storage_admin_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('hero-images', 'profile-images', 'content-images') AND public.is_admin());

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('hero-images', 'profile-images', 'content-images') AND public.is_admin());

-- ============================================
-- 11. GRANT İZİNLERİ
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Dinamik GRANT (sadece var olan tablolar için)
DO $$
DECLARE
    tbl TEXT;
    public_tables TEXT[] := ARRAY[
        'services', 'methods', 'blog_posts', 'podcast_episodes', 'youtube_videos',
        'hero_contents', 'about_contents', 'contact_info', 'certificates',
        'legal_contents', 'profile_images', 'working_config', 'reviews'
    ];
    insert_tables TEXT[] := ARRAY['reviews', 'contact_messages', 'appointments'];
BEGIN
    FOREACH tbl IN ARRAY public_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', tbl);
        END IF;
    END LOOP;

    FOREACH tbl IN ARRAY insert_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('GRANT INSERT ON public.%I TO anon, authenticated', tbl);
        END IF;
    END LOOP;
END $$;

GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_email() TO authenticated;

COMMIT;

-- ============================================
-- 12. DOĞRULAMA
-- ============================================

SELECT 'services' as tablo, count(*) as kayit FROM public.services
UNION ALL SELECT 'methods', count(*) FROM public.methods
UNION ALL SELECT 'about_contents', count(*) FROM public.about_contents
UNION ALL SELECT 'contact_info', count(*) FROM public.contact_info
UNION ALL SELECT 'hero_contents', count(*) FROM public.hero_contents;
