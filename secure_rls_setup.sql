-- ================================================================
-- 🛡️ SECURE RLS POLICIES (GÜVENLİ ERİŞİM KURALLARI)
-- ================================================================
-- Bu script, tüm tablolar için RLS'yi (Row Level Security) ETKİNLEŞTİRİR.
-- "En Az Yetki" (Least Privilege) prensibine göre kurallar tanımlar.

BEGIN;

-- 1. Helper Fonksiyon: Admin Kontrolü
-- Email tabanlı basit ve hızlı admin kontrolü
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('info@re-set.com.tr', 'admin@re-set.com.tr')
    OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tüm Tablolarda RLS'yi Aç (Devreye Al)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;


-- 3. Politikaları Temizle (Eskileri sil, conflict olmasın)
DROP POLICY IF EXISTS "Public Read" ON public.services;
DROP POLICY IF EXISTS "Admin Full Access" ON public.services;
-- ... (Diğer tablolar için de generic temizlik yapılabilir ama explicit create daha güvenli)


-- ================================================================
-- 🟢 PUBLIC READ (HERKES GÖREBİLİR) - SADECE İÇERİK
-- ================================================================
-- Ziyaretçilerin görmesi gereken tablolar

-- Services
DROP POLICY IF EXISTS "Public Read Services" ON public.services;
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Services" ON public.services;
CREATE POLICY "Admin All Services" ON public.services FOR ALL USING (public.is_admin());

-- Methods
DROP POLICY IF EXISTS "Public Read Methods" ON public.methods;
CREATE POLICY "Public Read Methods" ON public.methods FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Methods" ON public.methods;
CREATE POLICY "Admin All Methods" ON public.methods FOR ALL USING (public.is_admin());

-- Blog & Podcast & Youtube
DROP POLICY IF EXISTS "Public Read Blog" ON public.blog_posts;
CREATE POLICY "Public Read Blog" ON public.blog_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Blog" ON public.blog_posts;
CREATE POLICY "Admin All Blog" ON public.blog_posts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read Podcast" ON public.podcast_episodes;
CREATE POLICY "Public Read Podcast" ON public.podcast_episodes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Podcast" ON public.podcast_episodes;
CREATE POLICY "Admin All Podcast" ON public.podcast_episodes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read Youtube" ON public.youtube_videos;
CREATE POLICY "Public Read Youtube" ON public.youtube_videos FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admin All Youtube" ON public.youtube_videos;
CREATE POLICY "Admin All Youtube" ON public.youtube_videos FOR ALL USING (public.is_admin());

-- Site Content (Hero, About, Contact Info, Certificates, Reviews)
DROP POLICY IF EXISTS "Public Read Hero" ON public.hero_contents;
CREATE POLICY "Public Read Hero" ON public.hero_contents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Hero" ON public.hero_contents;
CREATE POLICY "Admin All Hero" ON public.hero_contents FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read About" ON public.about_contents;
CREATE POLICY "Public Read About" ON public.about_contents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All About" ON public.about_contents;
CREATE POLICY "Admin All About" ON public.about_contents FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read ContactInfo" ON public.contact_info;
CREATE POLICY "Public Read ContactInfo" ON public.contact_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All ContactInfo" ON public.contact_info;
CREATE POLICY "Admin All ContactInfo" ON public.contact_info FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read Certificates" ON public.certificates;
CREATE POLICY "Public Read Certificates" ON public.certificates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Certificates" ON public.certificates;
CREATE POLICY "Admin All Certificates" ON public.certificates FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (approved = true); -- Sadece onaylılar
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true); -- Herkes yorum yapabilir
DROP POLICY IF EXISTS "Admin All Reviews" ON public.reviews;
CREATE POLICY "Admin All Reviews" ON public.reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read Legal" ON public.legal_contents;
CREATE POLICY "Public Read Legal" ON public.legal_contents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Legal" ON public.legal_contents;
CREATE POLICY "Admin All Legal" ON public.legal_contents FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read ProfileImages" ON public.profile_images;
CREATE POLICY "Public Read ProfileImages" ON public.profile_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All ProfileImages" ON public.profile_images;
CREATE POLICY "Admin All ProfileImages" ON public.profile_images FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read Config" ON public.working_config;
CREATE POLICY "Public Read Config" ON public.working_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Config" ON public.working_config;
CREATE POLICY "Admin All Config" ON public.working_config FOR ALL USING (public.is_admin());


-- ================================================================
-- 🔴 PRIVATE / ADMIN ONLY (GİZLİ VERİLER)
-- ================================================================

-- Users (Herkes kendi profilini görür/düzenler, Admin hepsini)
DROP POLICY IF EXISTS "Users Own Profile" ON public.users;
CREATE POLICY "Users Own Profile" ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users Update Own" ON public.users;
CREATE POLICY "Users Update Own" ON public.users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admin All Users" ON public.users;
CREATE POLICY "Admin All Users" ON public.users FOR ALL USING (public.is_admin());

-- Contact Messages (Sadece Admin okur, Herkes yazabilir)
DROP POLICY IF EXISTS "Admin Read Messages" ON public.contact_messages;
CREATE POLICY "Admin Read Messages" ON public.contact_messages FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Public Write Messages" ON public.contact_messages;
CREATE POLICY "Public Write Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin All Messages" ON public.contact_messages;
CREATE POLICY "Admin All Messages" ON public.contact_messages FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Admin Delete Messages" ON public.contact_messages;
CREATE POLICY "Admin Delete Messages" ON public.contact_messages FOR DELETE USING (public.is_admin());

-- Clients (Sadece Admin)
DROP POLICY IF EXISTS "Admin All Clients" ON public.clients;
CREATE POLICY "Admin All Clients" ON public.clients FOR ALL USING (public.is_admin());

-- Invoices & Payments (Sadece Admin ve İlgili Client - Eğer client login varsa)
-- Şimdilik sadece Admin diyelim, client portal açılınca update ederiz.
DROP POLICY IF EXISTS "Admin All Invoices" ON public.invoices;
CREATE POLICY "Admin All Invoices" ON public.invoices FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admin All Payments" ON public.payments;
CREATE POLICY "Admin All Payments" ON public.payments FOR ALL USING (public.is_admin());

-- Ad Tracking (Sadece Admin)
DROP POLICY IF EXISTS "Admin All Ads" ON public.ad_accounts;
CREATE POLICY "Admin All Ads" ON public.ad_accounts FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admin All Campaigns" ON public.ad_campaigns;
CREATE POLICY "Admin All Campaigns" ON public.ad_campaigns FOR ALL USING (public.is_admin());

-- ================================================================
-- 🟠 MIXED ACCESS (RANDEVULAR & EĞİTİMLER)
-- ================================================================

-- Appointments
-- Admin hepsini görür.
-- Kullanıcılar (giriş yapmışsa) kendi randevularını görebilir.
-- Anonim kullanıcılar randevu oluşturabilir (INSERT).
DROP POLICY IF EXISTS "Admin All Appointments" ON public.appointments;
CREATE POLICY "Admin All Appointments" ON public.appointments FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Client Own Appointments" ON public.appointments;
CREATE POLICY "Client Own Appointments" ON public.appointments FOR SELECT USING (auth.uid() IN (SELECT id FROM public.users WHERE email = client_email));
DROP POLICY IF EXISTS "Public Create Appointment" ON public.appointments;
CREATE POLICY "Public Create Appointment" ON public.appointments FOR INSERT WITH CHECK (true); 

-- Progress Records & Resources (Client Portal)
-- Sadece ilgili müşteri ve admin görebilir.
DROP POLICY IF EXISTS "Admin All Progress" ON public.progress_records;
CREATE POLICY "Admin All Progress" ON public.progress_records FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Client Own Progress" ON public.progress_records;
CREATE POLICY "Client Own Progress" ON public.progress_records FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

DROP POLICY IF EXISTS "Admin All Resources" ON public.client_resources;
CREATE POLICY "Admin All Resources" ON public.client_resources FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Client Own Resources" ON public.client_resources;
CREATE POLICY "Client Own Resources" ON public.client_resources FOR SELECT USING (
  client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);


COMMIT;
