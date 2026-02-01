-- ================================================================
-- 🆘 ACİL DURUM: KULLANICI SENKRONİZASYONU VE ADMIN YETKİSİ
-- ================================================================

-- Bu script, giriş yapmaya çalıştığınız hesabınızı otomatik olarak
-- public.users tablosuyla eşleştirir ve ADMIN yetkisi verir.

INSERT INTO public.users (id, email, name, role, approved, registered_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', email), -- İsim yoksa emaili kullan
    'ADMIN', -- Herkesi ADMIN yap (Şimdilik giriş sorunu için)
    true,    -- Onaylı yap
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET 
    role = 'ADMIN',   -- Varsa ADMIN yap
    approved = true;  -- Varsa onayla

-- İşlem Tamamlandı.
-- Artık giriş yapabilmeniz gerekir.
