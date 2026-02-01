-- ============================================
-- 🚀 RESET ADMIN PANELİ - TAM SUPABASE KURULUMU
-- ============================================
-- Bu script tüm eksik tabloları, view'ları ve trigger'ları oluşturur
-- Tarih: 2024
-- ============================================

-- ============================================
-- 📋 BÖLÜM 1: TEMEL TABLOLAR (YOKSA OLUŞTUR)
-- ============================================

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'CLIENT')),
    approved BOOLEAN DEFAULT false,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients tablosu
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    notes TEXT,
    total_debt NUMERIC(12,2) DEFAULT 0,
    total_paid NUMERIC(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eksik kolonları ekle (varsa atla)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'total_debt') THEN
        ALTER TABLE clients ADD COLUMN total_debt NUMERIC(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'total_paid') THEN
        ALTER TABLE clients ADD COLUMN total_paid NUMERIC(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'is_active') THEN
        ALTER TABLE clients ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'name') THEN
        ALTER TABLE clients ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'full_name') THEN
        ALTER TABLE clients ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Services tablosu
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 60,
    price NUMERIC(10,2),
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments tablosu
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    service_title TEXT,
    notes TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Working Config tablosu
CREATE TABLE IF NOT EXISTS working_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_hour TEXT DEFAULT '10:00',
    end_hour TEXT DEFAULT '19:00',
    slot_duration INTEGER DEFAULT 60,
    off_days INTEGER[] DEFAULT '{0, 6}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan config ekle (yoksa)
INSERT INTO working_config (start_hour, end_hour, slot_duration, off_days)
SELECT '10:00', '19:00', 60, '{0, 6}'
WHERE NOT EXISTS (SELECT 1 FROM working_config);

-- Reviews tablosu
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    image TEXT,
    date DATE DEFAULT CURRENT_DATE,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages tablosu
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts tablosu
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image TEXT,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    "readTime" TEXT DEFAULT '5 dk',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcast Episodes tablosu
CREATE TABLE IF NOT EXISTS podcast_episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    image TEXT,
    duration TEXT,
    episode_number INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    spotify_url TEXT,
    apple_url TEXT,
    youtube_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Methods tablosu
CREATE TABLE IF NOT EXISTS methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image TEXT,
    details TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates tablosu
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT,
    year TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress Records tablosu
CREATE TABLE IF NOT EXISTS progress_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_number INTEGER,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
    topics_discussed TEXT,
    techniques_used TEXT,
    homework TEXT,
    notes TEXT,
    goals TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Resources tablosu
CREATE TABLE IF NOT EXISTS client_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('PDF', 'VIDEO', 'AUDIO', 'LINK', 'OTHER')),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Contents tablosu (KVKK, Gizlilik, Çerez)
CREATE TABLE IF NOT EXISTS legal_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('kvkk', 'privacy', 'cookies')),
    content TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- type kolonu unique yap (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'legal_contents' 
        AND indexname = 'legal_contents_type_key'
    ) THEN
        BEGIN
            ALTER TABLE legal_contents ADD CONSTRAINT legal_contents_type_key UNIQUE (type);
        EXCEPTION WHEN duplicate_table THEN
            -- constraint zaten var
        END;
    END IF;
END $$;

-- Hero Contents tablosu
CREATE TABLE IF NOT EXISTS hero_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image TEXT,
    button_text TEXT,
    button_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- key kolonu ekle (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_contents' AND column_name = 'key') THEN
        ALTER TABLE hero_contents ADD COLUMN key TEXT UNIQUE;
    END IF;
END $$;

-- Varsayılan hero içerik (sadece tablo boşsa)
INSERT INTO hero_contents (title, subtitle, description)
SELECT 'Profesyonel Destek', 'İle Kendinize Yatırım Yapın', 'Yaşam koçluğu ve psikolojik danışmanlık hizmetleri'
WHERE NOT EXISTS (SELECT 1 FROM hero_contents LIMIT 1);

-- About Contents tablosu
CREATE TABLE IF NOT EXISTS about_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- key kolonu ekle (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'about_contents' AND column_name = 'key') THEN
        ALTER TABLE about_contents ADD COLUMN key TEXT UNIQUE;
    END IF;
END $$;

-- Varsayılan about içerik (sadece tablo boşsa)
INSERT INTO about_contents (title, content)
SELECT 'Hakkımda', 'Profesyonel yaşam koçu ve danışman.'
WHERE NOT EXISTS (SELECT 1 FROM about_contents LIMIT 1);

-- Contact Info tablosu
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    phone TEXT,
    address TEXT,
    working_hours TEXT,
    google_maps_url TEXT,
    instagram TEXT,
    twitter TEXT,
    linkedin TEXT,
    youtube TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan contact info
INSERT INTO contact_info (email, phone)
SELECT 'info@reset.com.tr', '+90 555 123 45 67'
WHERE NOT EXISTS (SELECT 1 FROM contact_info);

-- Profile Images tablosu
CREATE TABLE IF NOT EXISTS profile_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- key kolonu ekle (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_images' AND column_name = 'key') THEN
        ALTER TABLE profile_images ADD COLUMN key TEXT UNIQUE;
    END IF;
END $$;

-- ============================================
-- 🧾 BÖLÜM 2: MUHASEBE TABLOLARI
-- ============================================

-- Sequence'ler oluştur
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS receipt_seq START 1;

-- Faturalar tablosu
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_no TEXT,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'TRY',
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled')),
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ödemeler tablosu
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    receipt_no TEXT,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'other')),
    description TEXT,
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 👁️ BÖLÜM 3: VIEW'LAR (RAPORLAR İÇİN)
-- ============================================

-- Client Balances View
DROP VIEW IF EXISTS client_balances CASCADE;
CREATE VIEW client_balances AS
SELECT 
    c.id AS client_id,
    COALESCE(c.full_name, c.name, c.email) AS full_name,
    c.email,
    c.phone,
    COALESCE(c.total_debt, 0) AS total_debt,
    COALESCE(c.total_paid, 0) AS total_paid,
    COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0) AS balance,
    CASE 
        WHEN COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0) > 0 THEN 'Borçlu'
        WHEN COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0) < 0 THEN 'Alacaklı'
        ELSE 'Dengeli'
    END AS balance_status,
    (SELECT COUNT(*) FROM invoices i WHERE i.client_id = c.id AND i.status IN ('unpaid', 'partial')) AS unpaid_invoice_count,
    c.is_active
FROM clients c
WHERE c.is_active = true
ORDER BY (COALESCE(c.total_debt, 0) - COALESCE(c.total_paid, 0)) DESC;

-- Unpaid Invoices View
DROP VIEW IF EXISTS unpaid_invoices CASCADE;
CREATE VIEW unpaid_invoices AS
SELECT 
    i.id,
    i.client_id,
    COALESCE(c.full_name, c.name, c.email) AS client_name,
    i.invoice_no,
    i.description,
    i.amount,
    i.paid_amount,
    i.amount - i.paid_amount AS remaining_amount,
    i.status,
    i.invoice_date,
    i.due_date,
    CASE 
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        WHEN i.due_date = CURRENT_DATE THEN 'due_today'
        ELSE 'upcoming'
    END AS due_status,
    CASE 
        WHEN i.due_date < CURRENT_DATE THEN CURRENT_DATE - i.due_date
        ELSE 0
    END AS days_overdue
FROM invoices i
JOIN clients c ON i.client_id = c.id
WHERE i.status IN ('unpaid', 'partial')
ORDER BY i.due_date ASC NULLS LAST;

-- Client Transactions View
DROP VIEW IF EXISTS client_transactions CASCADE;
CREATE VIEW client_transactions AS
SELECT 
    id,
    client_id,
    'invoice' AS transaction_type,
    invoice_no AS reference_no,
    description,
    amount AS debit,
    0 AS credit,
    invoice_date AS transaction_date,
    created_at
FROM invoices
WHERE status != 'cancelled'
UNION ALL
SELECT 
    id,
    client_id,
    'payment' AS transaction_type,
    receipt_no AS reference_no,
    COALESCE(description, 'Ödeme') AS description,
    0 AS debit,
    amount AS credit,
    payment_date AS transaction_date,
    created_at
FROM payments
ORDER BY transaction_date DESC, created_at DESC;

-- Monthly Revenue View
DROP VIEW IF EXISTS monthly_revenue CASCADE;
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', payment_date) AS month,
    SUM(amount) AS total_revenue,
    SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) AS cash_revenue,
    SUM(CASE WHEN payment_method = 'credit_card' THEN amount ELSE 0 END) AS card_revenue,
    SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) AS transfer_revenue,
    COUNT(*) AS payment_count
FROM payments
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- ============================================
-- ⚡ BÖLÜM 4: TRIGGER FONKSİYONLARI
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

-- Danışan toplam ödemesini güncelle
CREATE OR REPLACE FUNCTION update_client_paid()
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
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 🔗 BÖLÜM 5: TRIGGER'LARI BAĞLA
-- ============================================

-- Önceki trigger'ları sil
DROP TRIGGER IF EXISTS set_invoice_no ON invoices;
DROP TRIGGER IF EXISTS set_receipt_no ON payments;
DROP TRIGGER IF EXISTS update_debt_on_invoice ON invoices;
DROP TRIGGER IF EXISTS update_paid_on_payment ON payments;

-- Yeni trigger'ları oluştur
CREATE TRIGGER set_invoice_no
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_no();

CREATE TRIGGER set_receipt_no
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_no();

CREATE TRIGGER update_debt_on_invoice
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_client_debt();

CREATE TRIGGER update_paid_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_client_paid();

-- ============================================
-- 🔓 BÖLÜM 6: RLS DEVRE DIŞI BIRAK
-- ============================================
-- Uygulamanız custom auth kullandığı için RLS'yi devre dışı bırakıyoruz

DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'clients', 'services', 'appointments', 
            'reviews', 'contact_messages', 'blog_posts', 
            'podcast_episodes', 'methods', 'certificates',
            'progress_records', 'client_resources', 'legal_contents',
            'hero_contents', 'about_contents', 'contact_info',
            'profile_images', 'invoices', 'payments', 'working_config'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;
END $$;

-- ============================================
-- 👤 BÖLÜM 7: ADMIN KULLANICI OLUŞTUR
-- ============================================

-- info@re-set.com.tr kullanıcısını admin yap (varsa)
UPDATE users SET role = 'ADMIN', approved = true WHERE email = 'info@re-set.com.tr';

-- Admin kullanıcı ekle (yoksa)
INSERT INTO users (email, password, full_name, role, approved)
SELECT 'info@re-set.com.tr', '123456', 'Şafak Özkan', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'info@re-set.com.tr');

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '✅ RESET ADMIN PANELİ TAM KURULUM TAMAMLANDI!';
    RAISE NOTICE '✅ ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Oluşturulan Tablolar:';
    RAISE NOTICE '   ✓ users, clients, services, appointments';
    RAISE NOTICE '   ✓ reviews, contact_messages, blog_posts';
    RAISE NOTICE '   ✓ podcast_episodes, methods, certificates';
    RAISE NOTICE '   ✓ progress_records, client_resources';
    RAISE NOTICE '   ✓ invoices, payments, working_config';
    RAISE NOTICE '   ✓ hero_contents, about_contents, contact_info';
    RAISE NOTICE '   ✓ profile_images, legal_contents';
    RAISE NOTICE '';
    RAISE NOTICE '👁️ Oluşturulan View''lar:';
    RAISE NOTICE '   ✓ client_balances - Danışan bakiyeleri';
    RAISE NOTICE '   ✓ unpaid_invoices - Ödenmemiş faturalar';
    RAISE NOTICE '   ✓ client_transactions - İşlem geçmişi';
    RAISE NOTICE '   ✓ monthly_revenue - Aylık gelir raporu';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Trigger''lar:';
    RAISE NOTICE '   ✓ Otomatik fatura/makbuz numarası';
    RAISE NOTICE '   ✓ Otomatik borç/ödeme hesaplama';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS devre dışı bırakıldı';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Admin Giriş Bilgileri:';
    RAISE NOTICE '   Email: info@re-set.com.tr';
    RAISE NOTICE '   Şifre: 123456';
    RAISE NOTICE '';
END $$;
