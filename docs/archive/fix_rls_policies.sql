-- ============================================
-- 🛡️ FIX RLS POLICIES
-- ============================================
-- Bu script:
-- 1. users tablosundaki RLS'yi açar/günceller
-- 2. Mevcut politikaları temizler
-- 3. Basit ve güvenli politikalar ekler:
--    - Kullanıcılar kendi profillerini görebilir
--    - Adminler tüm profilleri görebilir/düzenleyebilir
--    - Service Role (server-side) tam yetkilidir
-- Tarih: 2026-01-13
-- ============================================

-- users tablosu için RLS'yi etkinleştir
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (çakışmaları önlemek için)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- ============================================
-- 🆕 YENİ POLİTİKALAR
-- ============================================

-- 1. SELECT: Herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (
    auth.uid() = id
);

-- 2. UPDATE: Herkes kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (
    auth.uid() = id
);

-- 3. ADMIN: Adminler (email check veya role check ile) her şeyi yapabilir
-- Basitlik için service_role veya belirli emailler
CREATE POLICY "Admins can do everything" 
ON public.users FOR ALL 
USING (
    -- Admin email kontrolü (geçici çözüm)
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('info@re-set.com.tr', 'admin@re-set.com.tr')
    OR 
    -- Veya users tablosundaki rolü ADMIN ise (recursive policy uyarısı olabilir, dikkat!)
    -- Recursive policy'den kaçınmak için jwt claim kullanmak daha iyidir ama şimdilik email yeterli.
    role = 'ADMIN'
);

-- 4. INSERT: Trigger ile yapıldığı için public insert kapalı kalsın (veya authenticated'a açık olsun)
-- Trigger "security definer" olduğu için RLS'yi bypass eder, buna gerek yok.

-- 5. Özel Durum: Schema Cache için dummy update
-- Bu bazen PostgREST schema cache'ini tetikler
COMMENT ON TABLE public.users IS 'User profiles synced with auth.users';
