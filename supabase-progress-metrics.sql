-- Create progress_metrics table
CREATE TABLE IF NOT EXISTS progress_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT 'blue',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add metrics column to progress_records
ALTER TABLE progress_records ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb;

-- Insert default metrics
INSERT INTO progress_metrics (key, label, description, icon, color, order_index, is_active)
VALUES 
    ('clarity', 'Aciklik ve Netlik', 'Zihinsel ve duygusal netlik', 'ri-eye-line', 'blue', 1, true),
    ('awareness', 'Farkindalik', 'Kendiniz hakkindaki farkindalik', 'ri-lightbulb-line', 'amber', 2, true),
    ('balance', 'Denge ve Merkezlilik', 'Ic dengeniz', 'ri-scales-line', 'green', 3, true),
    ('authenticity', 'Ozgunluk', 'Kendi degerlerinize uygun yasama', 'ri-user-heart-line', 'purple', 4, true),
    ('gratitude', 'Sukran', 'Sukran ve minnetarlik', 'ri-heart-line', 'pink', 5, true),
    ('empowerment', 'Guclenme', 'Guclu hissetme', 'ri-shield-star-line', 'teal', 6, true),
    ('inspiration', 'Ilham', 'Ilham ve motivasyon', 'ri-fire-line', 'red', 7, true)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS view_metrics ON progress_metrics FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS admin_manage_metrics ON progress_metrics FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_metrics_active ON progress_metrics(is_active);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_order ON progress_metrics(order_index);
CREATE INDEX IF NOT EXISTS idx_progress_records_metrics ON progress_records USING GIN (metrics);


