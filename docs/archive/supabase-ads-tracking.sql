-- ============================================
-- 📊 REKLAM TAKIP SİSTEMİ (Google Ads & Meta)
-- ============================================

-- Table: ad_accounts
CREATE TABLE IF NOT EXISTS ad_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('google_ads', 'meta_ads', 'tiktok_ads')),
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255),
  api_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: ad_campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('google_ads', 'meta_ads', 'tiktok_ads')),
  campaign_id VARCHAR(255),
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('active', 'paused', 'ended')),
  budget DECIMAL(12, 2),
  spent DECIMAL(12, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: ad_metrics (günlük metrikler)
CREATE TABLE IF NOT EXISTS ad_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  date_recorded DATE NOT NULL,
  
  -- Görünürlük Metrikler
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2), -- Click-Through Rate %
  
  -- Dönüşüm Metrikler
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(12, 2),
  cost_per_conversion DECIMAL(12, 2),
  
  -- Maliyet Metrikler
  cost DECIMAL(12, 2) DEFAULT 0,
  cpc DECIMAL(10, 2), -- Cost Per Click
  cpm DECIMAL(10, 2), -- Cost Per Mille (1000 impressions)
  
  -- YouTube Spesifik
  views INTEGER,
  watch_time_minutes INTEGER,
  engagements INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: ad_conversions (dönüşüm takibi)
CREATE TABLE IF NOT EXISTS ad_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  conversion_type VARCHAR(100), -- purchase, signup, booking, inquiry, etc.
  conversion_name VARCHAR(255),
  
  conversion_count INTEGER DEFAULT 0,
  conversion_value DECIMAL(12, 2),
  cost_per_acquisition DECIMAL(12, 2),
  
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: ad_roi_summary (aylık ROI özeti)
CREATE TABLE IF NOT EXISTS ad_roi_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  
  total_spend DECIMAL(12, 2) NOT NULL,
  total_revenue DECIMAL(12, 2),
  roi_percentage DECIMAL(8, 2), -- (Revenue - Spend) / Spend * 100
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_roi_summary ENABLE ROW LEVEL SECURITY;

-- Policies for ad_accounts
CREATE POLICY "Allow authenticated users to view ad_accounts"
  ON ad_accounts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert ad_accounts"
  ON ad_accounts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ad_accounts"
  ON ad_accounts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete ad_accounts"
  ON ad_accounts FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies for ad_campaigns
CREATE POLICY "Allow authenticated users to view ad_campaigns"
  ON ad_campaigns FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert ad_campaigns"
  ON ad_campaigns FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ad_campaigns"
  ON ad_campaigns FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policies for ad_metrics
CREATE POLICY "Allow authenticated users to view ad_metrics"
  ON ad_metrics FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert ad_metrics"
  ON ad_metrics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policies for ad_conversions
CREATE POLICY "Allow authenticated users to view ad_conversions"
  ON ad_conversions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert ad_conversions"
  ON ad_conversions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policies for ad_roi_summary
CREATE POLICY "Allow authenticated users to view ad_roi_summary"
  ON ad_roi_summary FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert ad_roi_summary"
  ON ad_roi_summary FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ad_roi_summary"
  ON ad_roi_summary FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- İNDEKSLER (Performance optimization)
-- ============================================

CREATE INDEX idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX idx_ad_metrics_campaign_id ON ad_metrics(campaign_id);
CREATE INDEX idx_ad_metrics_date ON ad_metrics(date_recorded);
CREATE INDEX idx_ad_conversions_campaign_id ON ad_conversions(campaign_id);
CREATE INDEX idx_ad_conversions_date ON ad_conversions(date_recorded);
CREATE INDEX idx_ad_roi_platform ON ad_roi_summary(platform);
CREATE INDEX idx_ad_roi_month ON ad_roi_summary(month);
