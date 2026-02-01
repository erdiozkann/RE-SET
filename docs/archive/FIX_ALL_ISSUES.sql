-- ============================================
-- 🛠️ FIX ALL ISSUES (User Sync + Image Visibility)
-- ============================================

BEGIN; -- İşlemleri bir paket olarak yap (Hata olursa geri al)

-- 1. ÇAKIŞAN ESKİ KAYITLARI TEMİZLE
-- Auth tablosunda olup public.users'da farklı ID ile duran 'zombi' kayıtları siler.
DELETE FROM public.users
WHERE email IN (SELECT email FROM auth.users)
AND id NOT IN (SELECT id FROM auth.users);

-- 2. EKSİK KULLANICILARI SENKRONİZE ET
-- Artık çakışma olmayacağı için temiz bir şekilde ekler.
INSERT INTO public.users (id, email, name, role, approved, registered_at, created_at)
SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    'CLIENT', 
    true, 
    au.created_at, 
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 3. HERO RESİMLERİNİ VE STORAGE'I DÜZELT (RLS FIX)
-- Tablo izinlerini aç
ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hero contents" ON public.hero_contents;
CREATE POLICY "Public can view hero contents"
ON public.hero_contents FOR SELECT
TO anon, authenticated
USING (true);

-- Storage bucketlarını public yap
UPDATE storage.buckets SET public = true 
WHERE id IN ('hero-images', 'profile-images', 'content-images');

-- Storage okuma izinlerini aç
DROP POLICY IF EXISTS "Public can view storage objects" ON storage.objects;
CREATE POLICY "Public can view storage objects"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('hero-images', 'profile-images', 'content-images'));

COMMIT; -- İşlemleri onayla
