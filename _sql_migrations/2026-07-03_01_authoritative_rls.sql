-- ============================================================================
--  RE-SET · users GÜVENLİK DÜZELTMESİ  (2026-07-03)
--  Canlı teşhisle DOĞRULANMIŞ kapsam. Diğer tablolar zaten is_admin() ile
--  güvenli olduğundan (RLS tümünde açık) yalnızca `users` + is_admin + password
--  ele alınır — çalışan akışlar (booking vb.) KORUNUR.
--
--  Kapatır:
--   C2 — "Admins can read/update all profiles" user_metadata'ya güveniyordu
--        (herhangi bir müşteri updateUser({data:{role:'ADMIN'}}) ile admin oluyordu)
--   H1 — "Users can update own profile" WITH CHECK yoktu (self role/approved yükseltme)
--   M1 — "Enable insert for all users" WITH CHECK (true)
--   M2 — public.users.password kolonu (ayrı 02 dosyasında düşürülür)
-- ============================================================================

BEGIN;

-- 0) is_admin() — user_metadata ASLA. admin_emails + app_metadata + sabit e-posta.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    OR lower(coalesce(auth.jwt() ->> 'email','')) IN ('info@re-set.com.tr','admin@re-set.com.tr')
    OR EXISTS (
      SELECT 1 FROM public.admin_emails
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
    );
$$;

-- 1) users — zafiyetli politikaları kaldır, güvenli set kur
DROP POLICY IF EXISTS "Admins can read all profiles"   ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles"  ON public.users;
DROP POLICY IF EXISTS "Users can update own profile"    ON public.users;
DROP POLICY IF EXISTS "Users can read own profile"      ON public.users;
DROP POLICY IF EXISTS "Enable insert for all users"     ON public.users;

CREATE POLICY "users_select_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_admin" ON public.users FOR SELECT USING (public.is_admin());

-- Ekleme: yalnızca kendi satırı, CLIENT + onaysız. (Asıl signup trigger'ı
-- SECURITY DEFINER olduğu için RLS'i baypas eder; bu, doğrudan insert'leri kısar.)
CREATE POLICY "users_insert_self"  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id AND role = 'CLIENT' AND COALESCE(approved,false) = false);

-- Güncelleme: kullanıcı kendi satırını güncelleyebilir; role/approved/email
-- trigger ile kilitlenir. Admin her şeyi yapar.
CREATE POLICY "users_update_own"   ON public.users FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_admin" ON public.users FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "users_delete_admin" ON public.users FOR DELETE USING (public.is_admin());

-- 2) Ayrıcalık kilidi: admin olmayan biri role/approved/email değiştiremez.
CREATE OR REPLACE FUNCTION public.users_prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role     := OLD.role;
    NEW.approved := OLD.approved;
    NEW.email    := OLD.email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_prevent_escalation ON public.users;
CREATE TRIGGER trg_users_prevent_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.users_prevent_privilege_escalation();

COMMIT;

-- Doğrulama (ayrı çalıştır):
--   SELECT tablename,policyname FROM pg_policies
--   WHERE qual ILIKE '%user_metadata%' OR with_check ILIKE '%user_metadata%';  -- 0 satır
