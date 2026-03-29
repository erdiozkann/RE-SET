
-- ============================================
-- 🔐 RE-SET ADMIN PERMISSIONS FIX
-- ============================================

-- Grant ALL permissions to admins on all content tables
-- This resolves 400 Errors during updates caused by RLS restrictions

-- Helper Function to grant permissions
CREATE OR REPLACE FUNCTION public.grant_admin_access(table_name text) RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %I" ON public.%I', table_name, table_name);
    EXECUTE format('CREATE POLICY "Admins manage %I" ON public.%I FOR ALL USING (
        (auth.jwt() -> ''user_metadata'' ->> ''role'') = ''ADMIN'' OR 
        (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''ADMIN'' OR
        (auth.jwt() ->> ''email'') = ''info@re-set.com.tr''
    )', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
SELECT public.grant_admin_access('hero_contents');
SELECT public.grant_admin_access('about_contents');
SELECT public.grant_admin_access('services');
SELECT public.grant_admin_access('methods');
SELECT public.grant_admin_access('blog_posts');
SELECT public.grant_admin_access('contact_info');
SELECT public.grant_admin_access('legal_contents');
SELECT public.grant_admin_access('certificates');
SELECT public.grant_admin_access('profile_images');
SELECT public.grant_admin_access('reviews');
SELECT public.grant_admin_access('contact_messages');
SELECT public.grant_admin_access('podcast_episodes');
SELECT public.grant_admin_access('youtube_videos');

COMMIT;
