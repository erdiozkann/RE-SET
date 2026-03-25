-- ============================================
-- 🚨 EMERGENCY ADMIN FIX
-- ============================================

-- 1. Get the User ID for 'info@re-set.com.tr'
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'info@re-set.com.tr';

    IF target_user_id IS NOT NULL THEN
        -- 2. Update auth.users metadata (Source of Truth for Auth)
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || '{"role": "ADMIN"}'::jsonb,
            raw_user_meta_data = raw_user_meta_data || '{"role": "ADMIN", "name": "Admin"}'::jsonb
        WHERE id = target_user_id;

        -- 3. Update public.users table (Application Profile)
        -- Insert or Update logic
        INSERT INTO public.users (id, email, role, approved, name)
        VALUES (target_user_id, 'info@re-set.com.tr', 'ADMIN', true, 'Admin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'ADMIN',
            approved = true;

        RAISE NOTICE 'User % promoted to ADMIN successfully.', target_user_id;
    ELSE
        RAISE NOTICE 'User info@re-set.com.tr not found in auth.users.';
    END IF;
END;
$$;
