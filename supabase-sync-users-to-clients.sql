-- Onaylanmış kullanıcıları clients tablosuna ekle (eğer yoksa)
INSERT INTO clients (name, email, phone, is_active, created_at)
SELECT 
  u.name,
  u.email,
  u.phone,
  true,
  COALESCE(u.registered_at, NOW())
FROM users u
WHERE u.approved = true 
  AND u.role = 'CLIENT'
  AND NOT EXISTS (
    SELECT 1 FROM clients c WHERE c.email = u.email
  );

-- Eklenen kayıtları kontrol et
SELECT c.id, c.name, c.email, c.phone, c.is_active, c.created_at
FROM clients c
ORDER BY c.created_at DESC;
