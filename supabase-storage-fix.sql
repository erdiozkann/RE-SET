-- ============================================
-- STORAGE BUCKET OLUŞTURMA VE POLİCY'LER
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- ============================================

-- 1. Bucket'ları oluştur (yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('podcast-images', 'podcast-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('podcast-audio', 'podcast-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Mevcut storage policy'lerini temizle
DROP POLICY IF EXISTS "Public read access for profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for podcast-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload podcast-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update podcast-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete podcast-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for podcast-audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload podcast-audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update podcast-audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete podcast-audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog-images" ON storage.objects;

-- Genel policy'leri de temizle
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

-- 3. Yeni basit policy'ler oluştur (TÜM bucket'lar için)

-- Herkes okuyabilir (public bucket'lar)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id IN ('profile-images', 'podcast-images', 'podcast-audio', 'blog-images'));

-- Herkes yükleyebilir (geliştirme için - production'da değiştirin)
CREATE POLICY "Allow all uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('profile-images', 'podcast-images', 'podcast-audio', 'blog-images'));

-- Herkes güncelleyebilir
CREATE POLICY "Allow all updates"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('profile-images', 'podcast-images', 'podcast-audio', 'blog-images'));

-- Herkes silebilir
CREATE POLICY "Allow all deletes"
ON storage.objects FOR DELETE
USING (bucket_id IN ('profile-images', 'podcast-images', 'podcast-audio', 'blog-images'));
