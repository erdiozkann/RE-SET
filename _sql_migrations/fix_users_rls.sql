
-- ============================================
-- 🔐 FIX USERS RLS POLICIES (DANGER ZONE)
-- ============================================

-- Function to safely drop policies
CREATE OR REPLACE FUNCTION drop_policies_if_exist(table_name text) RETURNS void AS $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = table_name LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 1. USERS TABLE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
SELECT drop_policies_if_exist('users');

-- 🛑 NON-RECURSIVE ADMIN CHECK
-- We strictly use JWT metadata to identify admins to avoid infinite loops.
-- Do NOT query the 'users' table inside these policies for admin checks.

CREATE POLICY "Users can read own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON users
    FOR SELECT
    USING (
        -- Hardcoded Super Admin Email Check (Zero DB Cost)
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr' 
        OR 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

CREATE POLICY "Admins can update all profiles" ON users
    FOR UPDATE
    USING (
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr' 
        OR 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- 2. CLIENTS TABLE
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
SELECT drop_policies_if_exist('clients');

CREATE POLICY "Admins can manage all clients" ON clients
    FOR ALL
    USING (
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr' 
        OR 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

CREATE POLICY "Users can read own client record" ON clients
    FOR SELECT
    USING (email = (auth.jwt() ->> 'email'));

-- 3. PAYMENTS TABLE
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
SELECT drop_policies_if_exist('payments');

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL
    USING (
        (auth.jwt() ->> 'email') = 'info@re-set.com.tr' 
        OR 
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    );

CREATE POLICY "Users can read own payments" ON payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = payments.client_id 
            AND clients.user_id = auth.uid()
        )
    );

COMMIT;
