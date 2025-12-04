-- ============================================
-- 👤 ADMIN KULLANICI OLUŞTURMA
-- ============================================

-- Önce mevcut users tablosunu kontrol et
SELECT * FROM users;

-- Eğer admin yoksa oluştur
INSERT INTO users (email, password, name, role, approved, registered_at)
VALUES (
    'info@re-set.com.tr',
    '123456',
    'Admin',
    'ADMIN',
    true,
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'ADMIN',
    approved = true;

-- Kontrol
SELECT id, email, name, role, approved FROM users WHERE email = 'info@re-set.com.tr';
