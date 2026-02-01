-- ============================================
-- 👑 MAKE SPECIFIC USER ADMIN
-- ============================================

-- Hedef: info@re-set.com.tr
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'info@re-set.com.tr';

-- Kontrol Et
SELECT email, role FROM public.users WHERE email = 'info@re-set.com.tr';
