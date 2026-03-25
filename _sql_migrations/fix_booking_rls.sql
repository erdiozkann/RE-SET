-- ============================================
-- 📅 FIX BOOKING & APPOINTMENTS RLS
-- ============================================

-- Helper function to safely drop policies
CREATE OR REPLACE FUNCTION drop_policies_if_exist(table_name text) RETURNS void AS $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = table_name LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 1. WORKING CONFIG (Read Access)
ALTER TABLE working_config ENABLE ROW LEVEL SECURITY;
SELECT drop_policies_if_exist('working_config');

CREATE POLICY "Enable read access for all users" ON working_config
    FOR SELECT USING (true);

CREATE POLICY "Enable all for admins" ON working_config
    FOR ALL
    USING (
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr' 
        OR 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

-- 2. APPOINTMENTS (Insert & Read)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
SELECT drop_policies_if_exist('appointments');

-- Clients can create appointments
CREATE POLICY "Clients can create appointments" ON appointments
    FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Clients can read their own appointments
CREATE POLICY "Clients can read own appointments" ON appointments
    FOR SELECT
    USING (auth.uid() = client_id);

-- Admins can do everything on appointments
CREATE POLICY "Admins can manage appointments" ON appointments
    FOR ALL
    USING (
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr' 
        OR 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

-- 3. SERVICES (Ensure Public Read)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- We might have done this, but ensuring won't hurt
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
CREATE POLICY "Enable read access for all users" ON services FOR SELECT USING (true);

COMMIT;
