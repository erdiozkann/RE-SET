-- ============================================
-- 🔓 RLS POLICY FIX FOR PUBLIC TABLES
-- ============================================
-- This script ensures that BOTH 'anon' (public) and 'authenticated' (logged in) users
-- can READ data from essential public tables.

-- Function to drop existing policies to avoid conflicts
CREATE OR REPLACE FUNCTION drop_policies_if_exist(table_name text) RETURNS void AS $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = table_name LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 1. Hero Contents
SELECT drop_policies_if_exist('hero_contents');
ALTER TABLE hero_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON hero_contents FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON hero_contents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON hero_contents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON hero_contents FOR DELETE USING (auth.role() = 'authenticated');

-- 2. About Contents
SELECT drop_policies_if_exist('about_contents');
ALTER TABLE about_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON about_contents FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON about_contents FOR ALL USING (auth.role() = 'authenticated');

-- 3. Contact Info
SELECT drop_policies_if_exist('contact_info');
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON contact_info FOR ALL USING (auth.role() = 'authenticated');

-- 4. Services
SELECT drop_policies_if_exist('services');
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON services FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON services FOR ALL USING (auth.role() = 'authenticated');

-- 5. Methods
SELECT drop_policies_if_exist('methods');
ALTER TABLE methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON methods FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON methods FOR ALL USING (auth.role() = 'authenticated');

-- 6. Certificates
SELECT drop_policies_if_exist('certificates');
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON certificates FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON certificates FOR ALL USING (auth.role() = 'authenticated');

-- 7. Blog Posts
SELECT drop_policies_if_exist('blog_posts');
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- 8. Podcast Episodes
SELECT drop_policies_if_exist('podcast_episodes');
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON podcast_episodes FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON podcast_episodes FOR ALL USING (auth.role() = 'authenticated');

-- 9. YouTube Videos
SELECT drop_policies_if_exist('youtube_videos');
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON youtube_videos FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON youtube_videos FOR ALL USING (auth.role() = 'authenticated');

-- 10. Profile Images
SELECT drop_policies_if_exist('profile_images');
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON profile_images FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON profile_images FOR ALL USING (auth.role() = 'authenticated');

-- 11. Legal Contents (KVKK, Privacy, Cookies)
SELECT drop_policies_if_exist('legal_contents');
ALTER TABLE legal_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON legal_contents FOR SELECT USING (true);
CREATE POLICY "Enable all modifications for authenticated users" ON legal_contents FOR ALL USING (auth.role() = 'authenticated');

-- 12. Client Resources
-- Note: Often client specific, but if public resources exist:
-- For now, let's keep it restricted or check definition. Assuming specific to client.
-- IF public resources are needed, uncomment below.
-- CREATE POLICY "Enable read access for all users" ON client_resources FOR SELECT USING (true);

COMMIT;
