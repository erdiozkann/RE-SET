-- MASTER RLS STANDARDIZATION FOR RE-SET DATABASE
-- This script cleans up all redundant policies and enforces a clean, secure pattern.

-- 0. Update is_admin() function to be dynamic based on admin_emails table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = auth.jwt() ->> 'email'
  ) OR (auth.jwt() ->> 'email' IN ('info@re-set.com.tr', 'admin@re-set.com.tr'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. BLOG POSTS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read Access" ON blog_posts;
    DROP POLICY IF EXISTS "Admin All Access" ON blog_posts;
END $$;
CREATE POLICY "Public Read Access" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin All Access" ON blog_posts FOR ALL USING (is_admin());

-- 2. SERVICES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage services" ON services;
    DROP POLICY IF EXISTS "Enable all modifications for authenticated users" ON services;
    DROP POLICY IF EXISTS "Enable read access for all users" ON services;
END $$;
CREATE POLICY "Public Read Access" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin All Access" ON services FOR ALL USING (is_admin());

-- 3. REVIEWS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admin All Reviews" ON reviews;
    DROP POLICY IF EXISTS "Admins can do everything on reviews" ON reviews;
    DROP POLICY IF EXISTS "Admins manage reviews" ON reviews;
    DROP POLICY IF EXISTS "Public Insert Reviews" ON reviews;
    DROP POLICY IF EXISTS "Public Read Reviews" ON reviews;
    DROP POLICY IF EXISTS "Public can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
    DROP POLICY IF EXISTS "authenticated_full_access_reviews" ON reviews;
    DROP POLICY IF EXISTS "public_read_approved_reviews" ON reviews;
    DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
    DROP POLICY IF EXISTS "reviews_public_insert" ON reviews;
    DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
END $$;
CREATE POLICY "Public Read Access" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Public Insert Access" ON reviews FOR INSERT WITH CHECK (approved = false);
CREATE POLICY "Admin All Access" ON reviews FOR ALL USING (is_admin());

-- 4. CONTACT MESSAGES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admin All Messages" ON contact_messages;
    DROP POLICY IF EXISTS "Admin Delete Messages" ON contact_messages;
    DROP POLICY IF EXISTS "Admin Read Messages" ON contact_messages;
    DROP POLICY IF EXISTS "Admins can do everything on contact_messages" ON contact_messages;
    DROP POLICY IF EXISTS "Admins manage contact_messages" ON contact_messages;
    DROP POLICY IF EXISTS "Public Write Messages" ON contact_messages;
    DROP POLICY IF EXISTS "Public can create contact messages" ON contact_messages;
    DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
    DROP POLICY IF EXISTS "authenticated_full_access_contact_messages" ON contact_messages;
    DROP POLICY IF EXISTS "messages_admin_delete" ON contact_messages;
    DROP POLICY IF EXISTS "messages_admin_manage" ON contact_messages;
    DROP POLICY IF EXISTS "messages_admin_read" ON contact_messages;
    DROP POLICY IF EXISTS "messages_public_insert" ON contact_messages;
END $$;
CREATE POLICY "Public Insert Access" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Access" ON contact_messages FOR ALL USING (is_admin());

-- 5. PODCAST EPISODES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage podcast_episodes" ON podcast_episodes;
    DROP POLICY IF EXISTS "Enable all modifications for authenticated users" ON podcast_episodes;
    DROP POLICY IF EXISTS "Enable read access for all users" ON podcast_episodes;
END $$;
CREATE POLICY "Public Read Access" ON podcast_episodes FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON podcast_episodes FOR ALL USING (is_admin());

-- 6. CONTENT TABLES
DO $$ 
DECLARE 
    tbl TEXT;
    p_name TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['hero_contents', 'about_contents', 'contact_info', 'profile_images', 'methods', 'certificates', 'legal_contents', 'working_config', 'youtube_videos']) LOOP
        -- Drop standard names
        FOR p_name IN SELECT unnest(ARRAY['Admins manage ' || tbl, 'Enable all modifications for authenticated users', 'Enable read access for all users', 'Enable delete for authenticated users only', 'Enable insert for authenticated users only', 'Enable update for authenticated users only', 'Public Read Access', 'Admin All Access']) LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p_name, tbl);
        END LOOP;
        
        EXECUTE format('CREATE POLICY "Public Read Access" ON %I FOR SELECT USING (true)', tbl);
        EXECUTE format('CREATE POLICY "Admin All Access" ON %I FOR ALL USING (is_admin())', tbl);
    END LOOP;
END $$;

-- 7. PROGRESS METRICS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can do everything on progress_metrics" ON progress_metrics;
    DROP POLICY IF EXISTS "admin_manage_metrics" ON progress_metrics;
    DROP POLICY IF EXISTS "view_metrics" ON progress_metrics;
    DROP POLICY IF EXISTS "Public Read Access" ON progress_metrics;
    DROP POLICY IF EXISTS "Admin All Access" ON progress_metrics;
END $$;
CREATE POLICY "Public Read Access" ON progress_metrics FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON progress_metrics FOR ALL USING (is_admin());

-- 8. MARKETING & ADS
DO $$ 
DECLARE 
    tbl TEXT;
    p_name TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['ad_accounts', 'ad_campaigns', 'ad_metrics', 'ad_conversions', 'ad_roi_summary', 'social_media_campaigns', 'social_media_analytics', 'instagram_accounts']) LOOP
        FOR p_name IN SELECT unnest(ARRAY['Admin All Access', 'Admin All Ads', 'Admin All Campaigns', 'Admins can do everything on ' || tbl, tbl || '_admin_only', tbl || '_insert_policy', tbl || '_select_policy', tbl || '_update_policy', 'admin_can_delete_campaigns', 'admin_can_manage_campaigns', 'admin_can_update_campaigns', 'admin_can_view_campaigns', 'admin_can_delete_instagram', 'admin_can_insert_instagram', 'admin_can_update_instagram', 'admin_can_view_instagram', 'admin_can_insert_analytics', 'admin_can_view_analytics']) LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p_name, tbl);
        END LOOP;
        
        EXECUTE format('CREATE POLICY "Admin All Access" ON %I FOR ALL USING (is_admin())', tbl);
    END LOOP;
END $$;

-- 9. OWNER/ADMIN TABLES
-- CLIENTS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;
    DROP POLICY IF EXISTS "Users can read own client record" ON clients;
    DROP POLICY IF EXISTS "Owner Read Access" ON clients;
    DROP POLICY IF EXISTS "Admin All Access" ON clients;
END $$;
CREATE POLICY "Owner Read Access" ON clients FOR SELECT USING (email = auth.jwt() ->> 'email');
CREATE POLICY "Admin All Access" ON clients FOR ALL USING (is_admin());

-- APPOINTMENTS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage appointments" ON appointments;
    DROP POLICY IF EXISTS "Clients can create appointments" ON appointments;
    DROP POLICY IF EXISTS "Clients can read own appointments" ON appointments;
    DROP POLICY IF EXISTS "Owner Read Access" ON appointments;
    DROP POLICY IF EXISTS "Owner Insert Access" ON appointments;
    DROP POLICY IF EXISTS "Admin All Access" ON appointments;
END $$;
CREATE POLICY "Owner Read Access" ON appointments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Owner Insert Access" ON appointments FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admin All Access" ON appointments FOR ALL USING (is_admin());

-- INVOICES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admin All Invoices" ON invoices;
    DROP POLICY IF EXISTS "Admins can do everything on invoices" ON invoices;
    DROP POLICY IF EXISTS "Clients can view their own invoices" ON invoices;
    DROP POLICY IF EXISTS "authenticated_full_access_invoices" ON invoices;
    DROP POLICY IF EXISTS "invoices_admin_only" ON invoices;
    DROP POLICY IF EXISTS "Owner Read Access" ON invoices;
    DROP POLICY IF EXISTS "Admin All Access" ON invoices;
END $$;
CREATE POLICY "Owner Read Access" ON invoices FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE email = (auth.jwt() ->> 'email')));
CREATE POLICY "Admin All Access" ON invoices FOR ALL USING (is_admin());

-- PAYMENTS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
    DROP POLICY IF EXISTS "Users can read own payments" ON payments;
    DROP POLICY IF EXISTS "Owner Read Access" ON payments;
    DROP POLICY IF EXISTS "Admin All Access" ON payments;
END $$;
CREATE POLICY "Owner Read Access" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.email = auth.jwt() ->> 'email'));
CREATE POLICY "Admin All Access" ON payments FOR ALL USING (is_admin());

-- 10. ADMIN EMAILS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admin Only All Access" ON admin_emails;
    DROP POLICY IF EXISTS "Enable read access for all users" ON admin_emails;
END $$;
CREATE POLICY "Admin Only All Access" ON admin_emails FOR ALL USING (is_admin());
