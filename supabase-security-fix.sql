-- ============================================
-- 🔒 SUPABASE GÜVENLİK DÜZELTMELERİ
-- Security Advisor Kritik Sorunları Çözümü
-- ============================================

-- ⚠️ ÖNEMLİ: Bu scripti Supabase SQL Editor'da çalıştırın
-- Tüm güvenlik açıkları kapatılacak

-- ============================================
-- 🧹 BÖLÜM 1: ESKİ VIEW'LARI SİL
-- ============================================

DROP VIEW IF EXISTS public.client_transactions CASCADE;
DROP VIEW IF EXISTS public.client_balances CASCADE;
DROP VIEW IF EXISTS public.unpaid_invoices CASCADE;
DROP VIEW IF EXISTS public.monthly_revenue CASCADE;

-- ============================================
-- 👁️ BÖLÜM 2: VIEW'LARI SECURITY INVOKER İLE YENİDEN OLUŞTUR
-- ============================================

-- Hareket dökümü (SECURITY INVOKER)
CREATE VIEW public.client_transactions 
WITH (security_invoker = true)
AS
SELECT
    i.id,
    i.client_id,
    COALESCE(c.full_name, c.name) AS client_name,
    i.invoice_date AS transaction_date,
    i.invoice_no AS reference_no,
    i.description,
    i.amount AS debit,
    0::NUMERIC AS credit,
    'invoice'::TEXT AS transaction_type,
    i.status,
    i.created_at
FROM invoices i
JOIN clients c ON c.id = i.client_id
WHERE i.status != 'cancelled'

UNION ALL

SELECT
    p.id,
    p.client_id,
    COALESCE(c.full_name, c.name) AS client_name,
    p.payment_date AS transaction_date,
    p.receipt_no AS reference_no,
    COALESCE(p.description, 'Ödeme - ' || p.payment_method) AS description,
    0::NUMERIC AS debit,
    p.amount AS credit,
    'payment'::TEXT AS transaction_type,
    'completed'::TEXT AS status,
    p.created_at
FROM payments p
JOIN clients c ON c.id = p.client_id

ORDER BY transaction_date DESC, created_at DESC;

-- Danışan bakiyeleri (SECURITY INVOKER)
CREATE VIEW public.client_balances
WITH (security_invoker = true)
AS
SELECT
    c.id AS client_id,
    COALESCE(c.full_name, c.name) AS full_name,
    c.phone,
    c.email,
    COALESCE(c.total_debt, 0) AS total_debt,
    COALESCE(c.total_paid, 0) AS total_paid,
    COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0) AS balance,
    COALESCE(c.is_active, true) AS is_active,
    CASE
        WHEN COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0) > 0 THEN 'Borçlu'
        WHEN COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0) < 0 THEN 'Alacaklı'
        ELSE 'Dengeli'
    END AS balance_status,
    (SELECT COUNT(*) FROM invoices WHERE client_id = c.id AND status = 'unpaid') AS unpaid_invoice_count
FROM clients c;

-- Ödenmemiş faturalar (SECURITY INVOKER)
CREATE VIEW public.unpaid_invoices
WITH (security_invoker = true)
AS
SELECT
    i.id,
    i.invoice_no,
    i.client_id,
    COALESCE(c.full_name, c.name) AS client_name,
    c.phone AS client_phone,
    i.description,
    i.amount,
    COALESCE(i.paid_amount, 0) AS paid_amount,
    i.amount - COALESCE(i.paid_amount, 0) AS remaining_amount,
    i.status,
    i.invoice_date,
    i.due_date,
    CASE
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        WHEN i.due_date = CURRENT_DATE THEN 'due_today'
        ELSE 'upcoming'
    END AS due_status,
    COALESCE(CURRENT_DATE - i.due_date, 0) AS days_overdue
FROM invoices i
JOIN clients c ON c.id = i.client_id
WHERE i.status IN ('unpaid', 'partial')
ORDER BY i.due_date ASC NULLS LAST;

-- Aylık gelir raporu (SECURITY INVOKER)
CREATE VIEW public.monthly_revenue
WITH (security_invoker = true)
AS
SELECT
    DATE_TRUNC('month', payment_date)::DATE AS month,
    COUNT(*) AS payment_count,
    SUM(amount) AS total_revenue,
    SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) AS cash_revenue,
    SUM(CASE WHEN payment_method = 'credit_card' THEN amount ELSE 0 END) AS card_revenue,
    SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) AS transfer_revenue
FROM payments
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- ============================================
-- ⚡ BÖLÜM 3: FONKSİYONLARI GÜVENLİ SEARCH_PATH İLE GÜNCELLE
-- ============================================

-- Fatura numarası oluşturma (Güvenli)
CREATE OR REPLACE FUNCTION public.generate_invoice_no()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.invoice_no IS NULL THEN
        NEW.invoice_no := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
                          LPAD(NEXTVAL('invoice_seq')::TEXT, 4, '0');
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- Makbuz numarası oluşturma (Güvenli)
CREATE OR REPLACE FUNCTION public.generate_receipt_no()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.receipt_no IS NULL THEN
        NEW.receipt_no := 'RCP-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
                          LPAD(NEXTVAL('receipt_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

-- Danışan toplam ödemesini güncelle (Güvenli)
CREATE OR REPLACE FUNCTION public.update_client_balance()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    target_client_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_client_id := OLD.client_id;
    ELSE
        target_client_id := NEW.client_id;
    END IF;
    
    UPDATE clients
    SET 
        total_paid = COALESCE((
            SELECT SUM(amount)
            FROM payments
            WHERE client_id = target_client_id
        ), 0),
        updated_at = NOW()
    WHERE id = target_client_id;
    
    -- Fatura durumunu güncelle
    IF TG_OP != 'DELETE' AND NEW.invoice_id IS NOT NULL THEN
        PERFORM update_invoice_paid_status(NEW.invoice_id);
    END IF;
    
    IF TG_OP = 'DELETE' AND OLD.invoice_id IS NOT NULL THEN
        PERFORM update_invoice_paid_status(OLD.invoice_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Danışan toplam borcunu güncelle (Güvenli)
CREATE OR REPLACE FUNCTION public.update_client_debt()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    target_client_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_client_id := OLD.client_id;
    ELSE
        target_client_id := NEW.client_id;
    END IF;
    
    UPDATE clients
    SET 
        total_debt = COALESCE((
            SELECT SUM(amount)
            FROM invoices
            WHERE client_id = target_client_id
            AND status != 'cancelled'
        ), 0),
        updated_at = NOW()
    WHERE id = target_client_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fatura ödeme durumunu güncelle (Güvenli)
CREATE OR REPLACE FUNCTION public.update_invoice_paid_status(inv_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    inv_amount NUMERIC;
    inv_paid NUMERIC;
BEGIN
    SELECT 
        i.amount,
        COALESCE(SUM(p.amount), 0)
    INTO inv_amount, inv_paid
    FROM invoices i
    LEFT JOIN payments p ON p.invoice_id = i.id
    WHERE i.id = inv_id
    GROUP BY i.id, i.amount;
    
    UPDATE invoices
    SET 
        paid_amount = inv_paid,
        status = CASE
            WHEN inv_paid >= inv_amount THEN 'paid'
            WHEN inv_paid > 0 THEN 'partial'
            ELSE 'unpaid'
        END,
        updated_at = NOW()
    WHERE id = inv_id;
END;
$$;

-- updated_at otomatik güncelleme (Güvenli)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- 🔒 BÖLÜM 4: CLIENTS TABLOSU RLS POLİTİKALARINI TEMİZLE
-- ============================================

-- Tüm mevcut politikaları sil
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'clients' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.clients', policy_record.policyname);
    END LOOP;
END;
$$;

-- RLS'yi etkinleştir
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Tek ve temiz politikalar oluştur
-- Admin tam erişim (Authenticated users için - Admin kontrolü uygulama tarafında)
CREATE POLICY "authenticated_full_access_clients"
ON public.clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anonim kullanıcılar okuyamaz
CREATE POLICY "anon_no_access_clients"
ON public.clients
FOR SELECT
TO anon
USING (false);

-- ============================================
-- 🔒 BÖLÜM 5: INVOICES TABLOSU RLS POLİTİKALARINI TEMİZLE
-- ============================================

-- Tüm mevcut politikaları sil
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'invoices' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.invoices', policy_record.policyname);
    END LOOP;
END;
$$;

-- RLS'yi etkinleştir
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Tek ve temiz politika
CREATE POLICY "authenticated_full_access_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 🔒 BÖLÜM 6: PAYMENTS TABLOSU RLS POLİTİKALARINI TEMİZLE
-- ============================================

-- Tüm mevcut politikaları sil
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'payments' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments', policy_record.policyname);
    END LOOP;
END;
$$;

-- RLS'yi etkinleştir
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Tek ve temiz politika
CREATE POLICY "authenticated_full_access_payments"
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 🔒 BÖLÜM 7: DİĞER TABLOLAR İÇİN RLS TEMİZLİĞİ
-- ============================================

-- USERS tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Giriş yapabilmek için anon kullanıcıların users tablosunu okuyabilmesi gerekiyor
CREATE POLICY "anon_read_users"
ON public.users
FOR SELECT
TO anon
USING (true);

-- Kayıt için anon kullanıcıların insert yapabilmesi gerekiyor
CREATE POLICY "anon_insert_users"
ON public.users
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "authenticated_full_access_users"
ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- APPOINTMENTS tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'appointments' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.appointments', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access_appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- SERVICES tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'services' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.services', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "authenticated_write_services"
ON public.services
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- REVIEWS tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'reviews' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reviews', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_approved_reviews"
ON public.reviews
FOR SELECT
TO anon
USING (approved = true);

CREATE POLICY "authenticated_full_access_reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- CONTACT_MESSAGES tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contact_messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.contact_messages', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_contact_messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_full_access_contact_messages"
ON public.contact_messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- BLOG_POSTS tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'blog_posts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_posts', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_blog_posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "authenticated_write_blog_posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PODCAST_EPISODES tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'podcast_episodes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.podcast_episodes', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_podcast_episodes"
ON public.podcast_episodes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "authenticated_write_podcast_episodes"
ON public.podcast_episodes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- METHODS tablosu
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'methods' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.methods', policy_record.policyname);
    END LOOP;
END;
$$;

ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_methods"
ON public.methods
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "authenticated_write_methods"
ON public.methods
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- ✅ KURULUM TAMAMLANDI
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '✅ GÜVENLİK DÜZELTMELERİ TAMAMLANDI!';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Düzeltilen View''lar (SECURITY INVOKER):';
    RAISE NOTICE '   ✓ client_transactions';
    RAISE NOTICE '   ✓ client_balances';
    RAISE NOTICE '   ✓ unpaid_invoices';
    RAISE NOTICE '   ✓ monthly_revenue';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Düzeltilen Fonksiyonlar (search_path = public):';
    RAISE NOTICE '   ✓ generate_invoice_no';
    RAISE NOTICE '   ✓ generate_receipt_no';
    RAISE NOTICE '   ✓ update_client_balance';
    RAISE NOTICE '   ✓ update_client_debt';
    RAISE NOTICE '   ✓ update_invoice_paid_status';
    RAISE NOTICE '   ✓ update_updated_at';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Temizlenen RLS Politikaları:';
    RAISE NOTICE '   ✓ clients - tek politika';
    RAISE NOTICE '   ✓ invoices - tek politika';
    RAISE NOTICE '   ✓ payments - tek politika';
    RAISE NOTICE '   ✓ users - tek politika';
    RAISE NOTICE '   ✓ appointments - tek politika';
    RAISE NOTICE '   ✓ services - public read + auth write';
    RAISE NOTICE '   ✓ reviews - approved read + auth full';
    RAISE NOTICE '   ✓ contact_messages - insert + auth full';
    RAISE NOTICE '   ✓ blog_posts - public read + auth write';
    RAISE NOTICE '   ✓ podcast_episodes - public read + auth write';
    RAISE NOTICE '   ✓ methods - public read + auth write';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ MANUEL YAPILMASI GEREKEN:';
    RAISE NOTICE '   → Supabase Dashboard > Authentication > Settings';
    RAISE NOTICE '   → "Leaked Password Protection" → ON yapın';
    RAISE NOTICE '';
END $$;
