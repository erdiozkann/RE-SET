-- ============================================
-- 🛡️ FIX HERO & STORAGE RLS POLICIES (Comprehensive)
-- ============================================

-- 1. Hero Contents Tablosunu Herkese Aç (Okuma)
ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hero contents" ON public.hero_contents;
CREATE POLICY "Public can view hero contents"
ON public.hero_contents FOR SELECT
TO anon, authenticated
USING (true);

-- Adminler için tam yetki
DROP POLICY IF EXISTS "Admins can manage hero contents" ON public.hero_contents;
CREATE POLICY "Admins can manage hero contents"
ON public.hero_contents FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

-- 2. Storage Bucket Ayarlarını Düzelt
-- Tüm ilgili bucketları public yap
UPDATE storage.buckets
SET public = true
WHERE id IN ('hero-images', 'profile-images', 'content-images');

-- Bucketler yoksa oluştur (Garanti olsun)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('hero-images', 'hero-images', true),
    ('profile-images', 'profile-images', true),
    ('content-images', 'content-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Nesneleri (Objects) için Okuma İzni
DROP POLICY IF EXISTS "Public can view storage objects" ON storage.objects;
CREATE POLICY "Public can view storage objects"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('hero-images', 'profile-images', 'content-images'));

-- Adminler için Yükleme/Silme İzni
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

DROP POLICY IF EXISTS "Admins can update files" ON storage.objects;
CREATE POLICY "Admins can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

-- 4. Yetkileri Tazele
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.hero_contents TO anon, authenticated;
GRANT SELECT ON public.about_contents TO anon, authenticated;
GRANT SELECT ON public.profile_images TO anon, authenticated;

-- Sonucu Kontrol Et
SELECT count(*) as hero_items FROM public.hero_contents;
