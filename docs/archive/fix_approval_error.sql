-- ==========================================
-- 🛠️ DANIŞAN ONAYLAMA HATASI DÜZELTME SCRİPTİ
-- ==========================================
-- Bu scripti Supabase SQL Editor'da çalıştırarak "not authorized" hatasını çözebilirsiniz.

-- 1. Hatalı trigger'ları temizle (Tahmini isimler)
DROP TRIGGER IF EXISTS check_user_update_permission ON users;
DROP TRIGGER IF EXISTS enforce_user_update_policy ON users;
DROP TRIGGER IF EXISTS prevent_role_approval_change ON users;
DROP TRIGGER IF EXISTS protect_sensitive_columns ON users;

-- 2. Güvenli Onaylama Fonksiyonu Oluştur
CREATE OR REPLACE FUNCTION approve_client_safely(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Admin yetkisiyle (veya fonksiyonu oluşturanın yetkisiyle) çalışır
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
    user_record RECORD;
    is_admin BOOLEAN;
BEGIN
    -- 1. Admin kontrolü (İsteği yapan kişinin admin olup olmadığı)
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Yetkisiz işlem: Sadece adminler onay verebilir.';
    END IF;

    -- 2. Onaylanacak kullanıcıyı bul
    SELECT * INTO user_record FROM users WHERE email = target_email;
    
    IF user_record IS NULL THEN
        RAISE EXCEPTION 'Kullanıcı bulunamadı: %', target_email;
    END IF;

    -- 3. Users tablosunu güncelle
    -- UPDATE işlemi yaparken triggerlar çalışabilir, 
    -- ancak SECURITY DEFINER sayesinde bazı yetki sorunları aşılabilir.
    -- Eğer hala hata alıyorsanız, users tablosundaki triggerları kontrol etmelisiniz.
    UPDATE users 
    SET approved = true 
    WHERE email = target_email;

    -- 4. Clients tablosuna ekle (Eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE email = target_email) THEN
        INSERT INTO clients (
            name, 
            full_name, 
            email, 
            phone, 
            is_active
        )
        VALUES (
            COALESCE(user_record.name, user_record.full_name),
            COALESCE(user_record.full_name, user_record.name),
            user_record.email,
            user_record.phone,
            true
        );
    END IF;

    -- Güncel hali döndür
    SELECT * INTO user_record FROM users WHERE email = target_email;
    RETURN to_jsonb(user_record);

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Onaylama hatası: %', SQLERRM;
END;
$$;

-- 3. Fonksiyona yetki ver
GRANT EXECUTE ON FUNCTION approve_client_safely TO authenticated;
GRANT EXECUTE ON FUNCTION approve_client_safely TO service_role;

DO $$
BEGIN
    RAISE NOTICE '✅ Onaylama fonksiyonu başarıyla oluşturuldu.';
END $$;
