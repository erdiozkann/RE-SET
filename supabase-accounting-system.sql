-- ============================================
-- 🟣 SUPABASE DANIŞAN MUHASEBE SİSTEMİ
-- Final Optimized Schema v2.0
-- ============================================

-- ⚠️ ÖNEMLİ: Bu scripti Supabase SQL Editor'da çalıştırın
-- Mevcut clients tablosu varsa, önce yedek alın!

-- ============================================
-- 🔄 SEQUENCE'LER (Otomatik Numara için)
-- ============================================

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS receipt_seq START 1;

-- ============================================
-- 📊 CLIENTS TABLOSUNU GÜNCELLE
-- ============================================

-- Mevcut clients tablosuna yeni kolonlar ekle
ALTER TABLE clients ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS register_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_debt NUMERIC(12,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_paid NUMERIC(12,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Eğer 'name' kolonu varsa, full_name'e kopyala
UPDATE clients SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;

-- Balance computed column (PostgreSQL 12+)
-- NOT: Supabase'de GENERATED ALWAYS AS STORED kullanılabilir
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS balance NUMERIC(12,2) GENERATED ALWAYS AS (total_debt - total_paid) STORED;

-- ============================================
-- 🧾 FATURALAR (INVOICES) TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_no TEXT UNIQUE,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    paid_amount NUMERIC(12,2) DEFAULT 0 CHECK (paid_amount >= 0),
    currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR')),
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled')),
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 💳 ÖDEMELER (PAYMENTS) TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    receipt_no TEXT UNIQUE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR')),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'other')),
    description TEXT,
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🔢 OTOMATIK NUMARA FONKSİYONLARI
-- ============================================

-- Fatura numarası oluşturma
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_no IS NULL THEN
        NEW.invoice_no := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
                          LPAD(NEXTVAL('invoice_seq')::TEXT, 4, '0');
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Makbuz numarası oluşturma
CREATE OR REPLACE FUNCTION generate_receipt_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_no IS NULL THEN
        NEW.receipt_no := 'RCP-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
                          LPAD(NEXTVAL('receipt_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ⚡ BAKİYE GÜNCELLEME FONKSİYONLARI
-- ============================================

-- Danışan toplam ödemesini güncelle
CREATE OR REPLACE FUNCTION update_client_balance()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Danışan toplam borcunu güncelle
CREATE OR REPLACE FUNCTION update_client_debt()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Fatura ödeme durumunu güncelle
CREATE OR REPLACE FUNCTION update_invoice_paid_status(inv_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 🔗 TRIGGER'LAR
-- ============================================

-- Mevcut trigger'ları temizle
DROP TRIGGER IF EXISTS trg_update_client_balance ON payments;
DROP TRIGGER IF EXISTS trg_update_client_debt ON invoices;
DROP TRIGGER IF EXISTS trg_generate_invoice_no ON invoices;
DROP TRIGGER IF EXISTS trg_generate_receipt_no ON payments;
DROP TRIGGER IF EXISTS trg_clients_updated ON clients;

-- Yeni trigger'lar
CREATE TRIGGER trg_update_client_balance
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_client_balance();

CREATE TRIGGER trg_update_client_debt
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_client_debt();

CREATE TRIGGER trg_generate_invoice_no
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_no();

CREATE TRIGGER trg_generate_receipt_no
BEFORE INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION generate_receipt_no();

CREATE TRIGGER trg_clients_updated
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 👁️ VIEW'LAR
-- ============================================

-- Hareket dökümü
CREATE OR REPLACE VIEW client_transactions AS
SELECT
    i.id,
    i.client_id,
    COALESCE(c.full_name, c.name) AS client_name,
    i.invoice_date AS transaction_date,
    i.invoice_no AS reference_no,
    i.description,
    i.amount AS debit,
    0::NUMERIC AS credit,
    'invoice' AS transaction_type,
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
    'payment' AS transaction_type,
    'completed' AS status,
    p.created_at
FROM payments p
JOIN clients c ON c.id = p.client_id

ORDER BY transaction_date DESC, created_at DESC;

-- Danışan bakiyeleri
CREATE OR REPLACE VIEW client_balances AS
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

-- Ödenmemiş faturalar
CREATE OR REPLACE VIEW unpaid_invoices AS
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

-- Aylık gelir raporu
CREATE OR REPLACE VIEW monthly_revenue AS
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
-- 📇 İNDEKSLER
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- ============================================
-- 🔒 ROW LEVEL SECURITY
-- ============================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Admin politikaları
DROP POLICY IF EXISTS "admin_full_access_invoices" ON invoices;
CREATE POLICY "admin_full_access_invoices"
ON invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_full_access_payments" ON payments;
CREATE POLICY "admin_full_access_payments"
ON payments FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ✅ KURULUM TAMAMLANDI
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '✅ MUHASEBE SİSTEMİ BAŞARIYLA KURULDU!';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tablolar:';
    RAISE NOTICE '   - clients (güncellendi)';
    RAISE NOTICE '   - invoices (faturalar)';
    RAISE NOTICE '   - payments (ödemeler)';
    RAISE NOTICE '';
    RAISE NOTICE '👁️ View''lar:';
    RAISE NOTICE '   - client_transactions (hareket dökümü)';
    RAISE NOTICE '   - client_balances (bakiyeler)';
    RAISE NOTICE '   - unpaid_invoices (ödenmemişler)';
    RAISE NOTICE '   - monthly_revenue (aylık gelir)';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Trigger''lar:';
    RAISE NOTICE '   - Otomatik fatura/makbuz numarası';
    RAISE NOTICE '   - Otomatik bakiye güncelleme';
    RAISE NOTICE '   - Otomatik fatura durumu güncelleme';
    RAISE NOTICE '';
END $$;
