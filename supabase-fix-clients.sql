-- ============================================
-- CLIENTS TABLOSU OLUŞTUR VE RLS AYARLA
-- ============================================

-- Tablo oluştur (yoksa)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS'i aktifleştir
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Clients viewable by admins" ON clients;
DROP POLICY IF EXISTS "Admins can manage clients" ON clients;
DROP POLICY IF EXISTS "Clients are viewable by everyone" ON clients;
DROP POLICY IF EXISTS "Anyone can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- Yeni policy'ler oluştur (herkese açık)
CREATE POLICY "Clients are viewable by everyone" ON clients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete clients" ON clients FOR DELETE USING (true);

-- Test: Bir danışan ekleyelim
-- INSERT INTO clients (name, email, phone, notes)
-- VALUES ('Test Danışan', 'test@example.com', '0532 123 45 67', 'Test notu')
-- ON CONFLICT (email) DO NOTHING;

-- Doğrulama
SELECT 'Clients tablosu hazır!' as message;
SELECT count(*) as total_clients FROM clients;
