-- ============================================
-- 🚨 FIX REGISTRATION ERROR (Database Error Saving New User)
-- ============================================
-- Bu script şunları yapar:
-- 1. public.users tablosundaki eksik kolonları (phone, registered_at vb.) oluşturur.
-- 2. Trigger fonksiyonunu "Güvenli Mod"da yeniden yazar.
-- 3. Yetki sorunlarını çözer.
-- ============================================

-- 1. TABLO YAPISINI GARANTİ ALTINA AL
DO $$
BEGIN
    -- 'phone' kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;

    -- 'registered_at' kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'registered_at') THEN
        ALTER TABLE public.users ADD COLUMN registered_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- 'role' kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'CLIENT';
    END IF;

    -- 'approved' kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approved') THEN
        ALTER TABLE public.users ADD COLUMN approved BOOLEAN DEFAULT false;
    END IF;

    -- 'name' kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE public.users ADD COLUMN name TEXT;
    END IF;
END $$;

-- 2. GÜVENLİ TRIGGER FONKSİYONU
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- RLS bypass için gerekli
SET search_path = public -- Güvenlik için path'i sabitle
AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- İsmi güvenli bir şekilde al (Metadata yoksa email'den üret)
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Insert işlemi
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
        user_name,
        NEW.raw_user_meta_data->>'phone', -- Null gelebilir, sorun değil
        'CLIENT',
        false, -- Varsayılan onay yok
        NEW.created_at,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Hata durumunda logla ama auth işlemini iptal etme (Opsiyonel: Hata fırlatılabilir)
    RAISE WARNING 'User sync trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. TRIGGER'I YENİLE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. YETKİLERİ DÜZELT (Service Role ve Postgres için)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- Authenticated kullanıcılar için temel okuma yetkisi (Trigger SECURITY DEFINER olduğu için insert'te sorun olmaz)
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE (name, phone) ON public.users TO authenticated;

-- ============================================
-- ✅ DÜZELTME TAMAMLANDI
-- ============================================
