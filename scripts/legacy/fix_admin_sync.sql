-- ==========================================
-- 🔄 SYNC PUBLIC USERS ROLE TO AUTH METADATA
-- ==========================================
-- This script ensures that when you update a user's role in the public.users table (e.g., via Admin Panel),
-- it automatically updates the auth.users raw_user_meta_data.
-- This is critical for RLS policies that rely on JWT metadata to avoid recursion.

-- 1. Create the Sync Function
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if role has changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_user_role_change ON public.users;

CREATE TRIGGER on_user_role_change
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();

-- 3. Run a one-time sync for existing admins (Optional but recommended)
DO $$
DECLARE
  user_record record;
BEGIN
  FOR user_record IN SELECT id, role FROM public.users WHERE role = 'ADMIN' LOOP
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', 'ADMIN')
    WHERE id = user_record.id;
  END LOOP;
END;
$$;
