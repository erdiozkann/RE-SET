-- ================================================================
-- 🧹 CLEANUP MOCK DATA (TEST VERİSİ TEMİZLİĞİ)
-- ================================================================

-- DİKKAT: Bu script, ADMIN kullanıcısı hariç, test amaçlı oluşturulmuş
-- tüm randevu, müşteri ve içerik verilerini siler.
-- Services (Hizmetler) tablosunu KORUR, çünkü site yapısı için gereklidir.

BEGIN;

-- 1. Randevuları Sil
DELETE FROM public.appointments;
-- ID sıralamasını sıfırlamak isterseniz (opsiyonel, genelde gerekmez):
-- ALTER SEQUENCE appointments_id_seq RESTART WITH 1;

-- 2. İletişim Mesajlarını Sil
DELETE FROM public.contact_messages;

-- 3. Yorumları (Reviews) Sil
DELETE FROM public.reviews;

-- 4. Blog İçeriklerini Sil
DELETE FROM public.blog_posts;
-- Podcastler KORUNDU (Kullanıcı verisi)
-- DELETE FROM public.podcast_episodes;

-- 5. Müşterileri (Clients) Sil
-- Referans hatası almamak için önce bağlı tabloları sildik (appointments, vb.)
DELETE FROM public.clients;

-- 6. Kullanıcıları (Users) Temizle (ADMIN HARİÇ)
-- 'ADMIN' rolüne sahip olmayan veya belirli bir email dışındaki tüm users kayıtlarını siler.
DELETE FROM public.users 
WHERE role != 'ADMIN' 
AND email NOT IN ('info@re-set.com.tr', 'admin@re-set.com.tr');

-- Not: auth.users tablosundan silme işlemi Supabase arayüzünden yapılmalıdır, 
-- script ile auth şemasına müdahale etmek risklidir ve yetki gerektirir.
-- public.users silindiğinde, auth.users ile sync bozulmaz ama veri tutarlılığı için 
-- Supabase Dashboard > Authentication > Users kısmından da ilgili test kullanıcılarını silebilirsiniz.

COMMIT;

-- 7. Doğrulama
SELECT count(*) as appointment_count FROM public.appointments;
SELECT count(*) as client_count FROM public.clients;
SELECT count(*) as message_count FROM public.contact_messages;

-- Temizlik Tamamlandı.
