-- RE-SET — Çifte-booking koruması (H2)
-- Aynı tarih+saate iki aktif randevu oluşturulmasını DB seviyesinde engeller.
-- Uygulama: Supabase Dashboard → SQL Editor → çalıştır.
-- (Yalnız kod tarafı UI filtresi yeterli değil: iki kullanıcı aynı anda son slotu
--  seçip gönderebilir → race condition. Unique index bunu kesin engeller.)
--
-- İPTAL edilmiş randevular slotu tekrar açmalı → partial unique index (status <> 'CANCELLED').
-- Çakışan mevcut kayıt varsa index oluşmaz; önce aşağıdaki teşhis ile temizleyin.

-- 1) Teşhis: aynı slotta birden fazla aktif randevu var mı?
SELECT date, time, count(*) AS adet
FROM public.appointments
WHERE status <> 'CANCELLED'
GROUP BY date, time
HAVING count(*) > 1
ORDER BY adet DESC;

-- 2) (Yukarıda satır dönerse önce çakışanları CANCELLED'a çekin / silin, sonra devam.)

-- 3) Partial unique index: aktif randevularda (date,time) benzersiz.
CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_active_slot
  ON public.appointments (date, time)
  WHERE status <> 'CANCELLED';

-- Doğrulama: index oluştu mu?
SELECT indexname FROM pg_indexes
WHERE tablename = 'appointments' AND indexname = 'appointments_unique_active_slot';
