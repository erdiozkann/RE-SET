
-- ============================================
-- 🚀 RE-SET FULL PRODUCTION DATABASE SYNC
-- ============================================

-- 1. FIX BLOG POSTS SCHEMA
-- Adds missing columns required by the UI but missing in DB
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Genel',
ADD COLUMN IF NOT EXISTS "readTime" TEXT DEFAULT '5 dk',
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS "featured_image" TEXT;

-- 2. FIX USERS TABLE RLS & PERMISSIONS
-- This ensures 'signUp' trigger and Admin Panel work correctly
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- Policies for public.users
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN' OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' OR
    (auth.jwt() ->> 'email') = 'info@re-set.com.tr'
);

CREATE POLICY "Users can read own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 🛑 CRITICAL: This allows the Auth Trigger to sync users from auth.users to public.users
CREATE POLICY "Enable insert for all users" ON public.users FOR INSERT WITH CHECK (true);

-- 3. FIX PUBLIC CONTENT RLS (Hero, About, Services, Methods, Blog)
-- Ensures site is visible to non-logged-in users

ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.hero_contents;
CREATE POLICY "Public Read Access" ON public.hero_contents FOR SELECT USING (true);

ALTER TABLE public.about_contents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.about_contents;
CREATE POLICY "Public Read Access" ON public.about_contents FOR SELECT USING (true);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.services;
CREATE POLICY "Public Read Access" ON public.services FOR SELECT USING (true);

ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.methods;
CREATE POLICY "Public Read Access" ON public.methods FOR SELECT USING (true);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.blog_posts;
CREATE POLICY "Public Read Access" ON public.blog_posts FOR SELECT USING (true);

-- 4. STORAGE POLICIES
-- Ensure profile-images bucket is public read and admin write
-- (Run this if you have problems with images not loading)

-- Note: Storage policies usually need to be set in the Supabase UI 
-- for easier management, but here are the SQL equivalents:

/*
-- Policy for public read
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');

-- Policy for Admin upload
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN' OR
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr'
    )
);
*/

-- 5. FINAL CHECK: Ensure the admin user has the correct role in app_metadata
-- (Replace with actual admin user ID if needed, or run from UI)
-- UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"ADMIN"}' WHERE email = 'info@re-set.com.tr';

COMMIT;
