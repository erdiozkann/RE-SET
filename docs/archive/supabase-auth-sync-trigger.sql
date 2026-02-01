-- ============================================
-- 🔐 AUTH USER SYNC TRIGGER
-- ============================================
-- Bu script, Supabase Auth (auth.users) ile public.users tablosunu otomatik senkronize eder.
-- Artık frontend'den manuel INSERT yapmaya gerek yok!
-- Tarih: 2026-01-13
-- ============================================

-- 1. Önce users tablosunun yapısını düzelt (password zorunlu değil)
DO $$
BEGIN
    -- password kolonunu nullable yap (varsa)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    END IF;
    
    -- name kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name TEXT;
    END IF;
END $$;

-- 2. Auth User Sync Fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Yeni kayıt olan kullanıcıyı public.users tablosuna ekle
    INSERT INTO public.users (
        id,
        email,
        name,
        phone,
        role,
        approved,
        registered_at,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        'CLIENT',  -- Varsayılan olarak CLIENT rolü
        false,     -- Varsayılan olarak onaysız
        NEW.created_at,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- 3. Eski trigger'ı sil ve yenisini oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Mevcut auth.users'ları public.users'a senkronize et (Tek seferlik)
-- Sadece henüz eklenmemiş kullanıcıları ekle
INSERT INTO public.users (id, email, name, role, approved, registered_at, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
    'CLIENT',
    false,
    created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.id = au.id OR pu.email = au.email
);

-- 5. Admin kullanıcıları düzelt (email bazlı)
UPDATE public.users 
SET role = 'ADMIN', approved = true 
WHERE email IN ('info@re-set.com.tr', 'admin@re-set.com.tr');

-- ============================================
-- ✅ TRIGGER KURULUMU TAMAMLANDI
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '✅ AUTH USER SYNC TRIGGER KURULUMU TAMAMLANDI';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📌 Artık her yeni Supabase Auth kaydı otomatik olarak';
    RAISE NOTICE '   public.users tablosuna eklenir.';
    RAISE NOTICE '';
    RAISE NOTICE '📌 Frontend''den manuel INSERT yapmaya GEREK YOK!';
    RAISE NOTICE '';
END $$;
