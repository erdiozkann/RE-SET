-- ============================================
-- TÜM TABLOLAR İÇİN RLS AKTİF ET
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- ============================================

-- 1. users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. progress_records
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;

-- 6. client_resources
ALTER TABLE public.client_resources ENABLE ROW LEVEL SECURITY;

-- 7. methods
ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;

-- 8. reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 9. certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 10. working_config
ALTER TABLE public.working_config ENABLE ROW LEVEL SECURITY;

-- 11. contact_info
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- 12. profile_images
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;

-- 13. blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 14. podcast_episodes
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

-- 15. hero_contents
ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;

-- 16. contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 17. about_contents
ALTER TABLE public.about_contents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- IMAGE SÜTUNLARI EKLE (Eğer yoksa)
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hero_contents' AND column_name = 'image'
    ) THEN
        ALTER TABLE hero_contents ADD COLUMN image TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_contents' AND column_name = 'image'
    ) THEN
        ALTER TABLE about_contents ADD COLUMN image TEXT;
    END IF;
END $$;

-- About için varsayılan resim ayarla
UPDATE about_contents 
SET image = 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg'
WHERE image IS NULL;

-- ============================================
-- KONTROL - RLS Durumunu Göster
-- ============================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
