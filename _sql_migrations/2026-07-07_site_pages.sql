-- ============================================================================
-- site_pages — panelden yönetilebilen içerik sayfaları (CMS)
-- FAZ 2: /demartini-seansi, /deger-belirleme, /sss vb. sayfalar bu tablodan
-- gelir; admin panelinden düzenlenir, prerender build zamanında çeker.
-- RLS deseni authoritative_rls.sql ile aynı: public read (yayınlı), admin write.
-- RE-SET Supabase SQL Editor'de çalıştır.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_pages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text DEFAULT '',
  content     text DEFAULT '',           -- markdown
  is_published boolean DEFAULT false,
  sort_order  int DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Public: yalnızca yayınlı sayfaları okuyabilir; admin hepsini.
DROP POLICY IF EXISTS "site_pages_select_public" ON public.site_pages;
CREATE POLICY "site_pages_select_public" ON public.site_pages
  FOR SELECT USING (is_published = true OR public.is_admin());

-- Yazma yalnızca admin.
DROP POLICY IF EXISTS "site_pages_insert_admin" ON public.site_pages;
CREATE POLICY "site_pages_insert_admin" ON public.site_pages
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_pages_update_admin" ON public.site_pages;
CREATE POLICY "site_pages_update_admin" ON public.site_pages
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_pages_delete_admin" ON public.site_pages;
CREATE POLICY "site_pages_delete_admin" ON public.site_pages
  FOR DELETE USING (public.is_admin());

-- updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION public.touch_site_pages() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_touch_site_pages ON public.site_pages;
CREATE TRIGGER trg_touch_site_pages BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_site_pages();

-- ---------------------------------------------------------------------------
-- Seed: FAZ 2 draft sayfaları (is_published = false → önce panelden gözden
-- geçir/Şafak input ekle, sonra yayınla). İçerik markdown.
-- ---------------------------------------------------------------------------
INSERT INTO public.site_pages (slug, title, description, content, is_published, sort_order)
VALUES
(
  'demartini-seansi',
  'Demartini Seansı Nasıl Geçer?',
  'Demartini seansı nasıl geçer, ne kadar sürer, online yapılır mı? Eğitimli uygulayıcı Şafak Özkan ile birebir Demartini Yöntemi seansının akışını öğrenin.',
  E'Demartini seansı, eğitimli bir uygulayıcı eşliğinde, belirli bir olay, kişi ya da duyguya dair algınızı sistematik sorularla dengelediğiniz birebir bir çalışmadır. Genellikle 60–90 dakika sürer; yüz yüze veya online yapılabilir.\n\n## Seans ne kadar sürer?\nBirebir Demartini seansları genellikle 60–90 dakikadır. Konunun yoğunluğuna göre 2–6 seanslık bir süreç önerilebilir. İlk adım, 30 dakikalık ücretsiz keşif görüşmesidir.\n\n## Seansta ne yapılır?\n1. Konunun belirlenmesi — duygusal yük taşıyan bir olay, kişi ya da özellik seçilir.\n2. Değerlerin bağlamı — Değer Belirleme Süreci ile konunun değerlerinizle ilişkisi netleşir.\n3. Kutupların dengelenmesi — Quantum Collapse Process ile tek yönlü algı sistematik sorularla iki yönlü hâle getirilir.\n4. Minnete geçiş — iki kutup dengelendiğinde suçlama/idealleştirme yerini netlik ve minnete bırakır.\n\n## Online Demartini seansı yapılabilir mi?\nEvet. Zoom veya Google Meet üzerinden yapılan online seanslar, yüz yüze seansla eşdeğer akışta ilerler.\n\n## Seansa nasıl hazırlanırım?\nÇalışmak istediğiniz bir konu üzerine önceden düşünmek faydalıdır; ancak süreç uygulayıcının rehberliğinde ilerlediği için özel bir hazırlık şart değildir.\n\n---\n*Demartini Yöntemi bir eğitim ve kişisel gelişim aracıdır; herhangi bir psikolojik veya tıbbi rahatsızlığı teşhis veya tedavi etmez, profesyonel ruh sağlığı desteğinin yerine geçmez.*',
  false,
  10
),
(
  'deger-belirleme',
  'Değer Belirleme Çalışması Nedir?',
  'Değer belirleme çalışması nedir, değerler hiyerarşisi neyi gösterir? Demartini Yöntemi''nin temeli olan Değer Belirleme Süreci''ni öğrenin.',
  E'Değer belirleme çalışması, kişinin gerçek değerler hiyerarşisini — zamanını, enerjisini ve dikkatini gerçekte neye verdiğini — 13 reflektif soru üzerinden ortaya çıkaran bir süreçtir. Demartini Yöntemi''nin ilk ve temel adımıdır.\n\n## Değerler hiyerarşisi neyi gösterir?\nHayatınızda neyin en üstte olduğunu gösteren içsel bir haritadır. Zamanınızı, enerjinizi, paranızı en çok neye ayırdığınız bu haritayı ortaya koyar.\n\n## Neden önemli?\nKişi kendi değerlerinin en üstündeki alanla uyumlu yaşadığında disiplinli, odaklı ve ilhamlı olur. Birçok tıkanma ve motivasyon kaybının kökeninde değerlerine göre yaşamamak vardır.\n\n---\n*Demartini Yöntemi bir eğitim ve kişisel gelişim aracıdır; teşhis veya tedavi etmez, profesyonel ruh sağlığı desteğinin yerine geçmez.*',
  false,
  20
)
ON CONFLICT (slug) DO NOTHING;
