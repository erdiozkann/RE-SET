-- ============================================
-- 🔄 SYNC MISSING USERS (Auth -> Public.Users)
-- ============================================

-- Auth tablosunda olup Public Users tablosunda olmayan kullanıcıları aktar
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    approved,
    registered_at,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    'CLIENT', -- Varsayılan rol
    true,     -- Mevcut kullanıcıları onaylı say (sorun yaşamamaları için)
    au.created_at,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Sonucu göster
SELECT COUNT(*) as fixed_users_count FROM public.users;
