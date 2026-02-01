-- ============================================
-- 🔍 KULLANICI GİRİŞ SORUNU TANI
-- ============================================
-- erdiozkann@gmail.com ve diğer kullanıcıların durumunu kontrol eder
-- Tarih: 2026-01-13
-- ============================================

-- 1. Önce auth.users'daki tüm kullanıcıları listele
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data->>'name' as meta_name
FROM auth.users
ORDER BY created_at DESC;

-- 2. public.users tablosundaki kullanıcıları listele
SELECT 
    id,
    email,
    name,
    role,
    approved,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Spesifik olarak erdiozkann@gmail.com kullanıcısını kontrol et
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as profile_id,
    pu.email as profile_email,
    pu.role,
    pu.approved,
    CASE WHEN au.id = pu.id THEN '✅ ID eşleşiyor' ELSE '❌ ID EŞLEŞMİYOR' END as id_match
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email ILIKE '%erdiozkann%' OR au.email ILIKE '%erdiozkan%';

-- 4. Auth'ta olup public.users'ta OLMAYAN kullanıcıları bul
SELECT 
    au.id,
    au.email,
    au.created_at,
    'PROFIL YOK - GİRİŞ YAPAMAZLAR!' as durum
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 5. Eğer erdiozkann@gmail.com yoksa, onu admin yap (manuel müdahale)
-- Önce auth.users'ta olduğundan emin ol, sonra public.users'a ekle
INSERT INTO public.users (id, email, name, role, approved, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
    'ADMIN',  -- Admin olarak ekle
    true,     -- Onaylı olarak ekle
    NOW()
FROM auth.users
WHERE email = 'erdiozkann@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'erdiozkann@gmail.com'
  );

-- 6. Eğer erdiozkann@gmail.com zaten varsa, admin yap ve onayla
UPDATE public.users
SET role = 'ADMIN', approved = true
WHERE email = 'erdiozkann@gmail.com';

-- ============================================
-- ✅ KONTROL TAMAMLANDI
-- ============================================
