// TEK KAYNAK — sayfa başlık/açıklama/H1 meta'sı.
// Hem build-zamanı prerender (src/prerender.tsx) hem client SEO (sayfa
// bileşenleri → components/SEO.tsx) buradan okur. Böylece bot'un gördüğü statik
// başlık ile JS mount sonrası client başlığı BİREBİR aynı olur (title-flip yok).
//
// Marka her yerde "RE-SET" (eski "Reset Danışmanlık" bırakıldı). Başlıklar
// keyword-yığını değil, tek net değer önerisi taşır.

export const SITE_URL = "https://re-set.com.tr";
export const BRAND = "RE-SET";

export type RouteMeta = {
  title: string;
  description: string;
};

// İndekslenen public sayfalar. Anahtar = route path (canonical, trailing-slash yok).
export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "RE-SET | Şafak Özkan — Demartini Yöntemi ve Metodu Türkiye",
    description:
      "Demartini Yöntemi (Demartini Metodu) Türkiye uygulayıcısı Şafak Özkan ile İstanbul/Tarabya'da değer belirleme, ilişki dengeleme ve kişisel dönüşüm seansları.",
  },
  "/about": {
    title: "Hakkımda — Şafak Özkan | Demartini Yöntemi (Metodu)",
    description:
      "Eğitimli Demartini Yöntemi (Metodu) uygulayıcısı Şafak Özkan. 11 yıllık uygulama deneyimi, Tarabya / İstanbul.",
  },
  "/demartini-yontemi": {
    title: "Demartini Yöntemi — Şafak Özkan | RE-SET Türkiye",
    description:
      "Demartini Yöntemi (Demartini Metodu): Eğitimli uygulayıcı Şafak Özkan ile İstanbul/Tarabya'da değer belirleme, Breakthrough Experience, Quantum Collapse Process ve ilişki dengeleme seansları.",
  },
  "/primordial-ses-meditasyonu": {
    title: "Primordial Ses Meditasyonu — Şafak Özkan | RE-SET İstanbul",
    description:
      "Primordial Ses (Sound) Meditasyonu: kişiye özel mantra ile sessiz meditasyon uygulaması. İstanbul/Tarabya'da eğitmen Şafak Özkan ile yüz yüze ve online mantra meditasyonu.",
  },
  "/demartini-seansi": {
    title: "Demartini Seansı — İstanbul & Online | Şafak Özkan",
    description:
      "Demartini seansı: 13 sorulu Değer Belirleme + Quantum Collapse Process ile birebir algı dengeleme. İstanbul Tarabya'da yüz yüze veya online; eğitimli uygulayıcı Şafak Özkan ile. Ücretsiz keşif görüşmesiyle başlayın.",
  },
  "/deger-belirleme": {
    title: "Değer Belirleme Süreci (13 Soru) | Şafak Özkan — RE-SET",
    description:
      "Dr. John Demartini'nin 13 sorulu Değer Belirleme Süreci ile gerçek değerler hiyerarşinizi keşfedin. Kariyer, ilişki ve önceliklerde netlik — İstanbul'da yüz yüze veya online.",
  },
  "/breakthrough-experience": {
    title: "Breakthrough Experience — 2 Günlük Program | RE-SET",
    description:
      "Dr. John Demartini'nin 2 tam günlük amiral programı Breakthrough Experience: Değer Belirleme + Quantum Collapse Process'i uygulamalı deneyimleyin. Türkiye uygulaması — Şafak Özkan.",
  },
  "/blog": {
    title: "Blog | RE-SET — Şafak Özkan",
    description:
      "Demartini Metodu, değer belirleme, ilişki dengeleme ve kişisel dönüşüm üzerine güncel yazılar.",
  },
  "/podcast": {
    title: "Podcast | RE-SET — Şafak Özkan",
    description:
      "Şafak Özkan'ın Demartini Metodu ve kişisel dönüşüm üzerine podcast bölümleri.",
  },
  "/youtube": {
    title: "YouTube | RE-SET — Şafak Özkan",
    description:
      "Demartini Metodu, değer belirleme ve Breakthrough Experience üzerine video içerikler. Şafak Özkan ile yaşam dönüşümü.",
  },
  "/booking": {
    title: "Randevu Al | Şafak Özkan — Demartini Metodu",
    description:
      "Şafak Özkan ile Demartini Yöntemi seansı için randevu alın. Ücretsiz keşif görüşmesi için iletişime geçin veya hesap oluşturarak online planlayın.",
  },
  "/contact": {
    title: "İletişim | RE-SET — Şafak Özkan",
    description:
      "Sorularınız için bana ulaşabilir, ücretsiz keşif görüşmenizi planlayabilirsiniz. İstanbul Tarabya'da Demartini Metodu ve değer belirleme danışmanlığı.",
  },
  "/privacy": {
    title: "Gizlilik Politikası | RE-SET",
    description:
      "RE-SET — Şafak Özkan gizlilik politikası ve kullanıcı verilerinin korunması.",
  },
  "/kvkk": {
    title: "KVKK Aydınlatma Metni | RE-SET",
    description:
      "Kişisel Verilerin Korunması Kanunu kapsamında RE-SET — Şafak Özkan aydınlatma metni.",
  },
  "/copyright": {
    title: "Telif Hakkı | RE-SET",
    description: "RE-SET — Şafak Özkan telif hakları ve içerik kullanım koşulları.",
  },
  "/cookies": {
    title: "Çerez Politikası | RE-SET",
    description: "RE-SET web sitesi çerez politikası ve çerez yönetim seçenekleri.",
  },
};

// Görünür sayfa başlıkları (H1). Prerender statik gövdesi + sayfa bileşenleri
// aynı H1'i kullanmalı (prerender↔client H1 hizası).
export const ROUTE_HEADING: Record<string, string> = {
  "/": "Demartini Yöntemi (Metodu) — Şafak Özkan · İstanbul",
  "/about": "Hakkımda — Şafak Özkan | Demartini Metodu Uygulayıcısı",
  "/demartini-yontemi": "Demartini Yöntemi (Demartini Metodu) Nedir?",
  "/primordial-ses-meditasyonu": "Primordial Ses (Sound) Meditasyonu Nedir?",
  "/demartini-seansi": "Demartini Seansı — İstanbul (Tarabya) & Online",
  "/deger-belirleme": "Değer Belirleme Süreci: 13 Soruyla Değerler Hiyerarşiniz",
  "/breakthrough-experience": "Breakthrough Experience — 2 Günlük Dönüşüm Programı",
  "/blog": "Blog — Demartini Metodu ve Kişisel Dönüşüm",
  "/podcast": "Podcast — Demartini Metodu ile Kişisel Dönüşüm",
  "/youtube": "YouTube — Demartini Metodu İçerikleri",
  "/booking": "Randevu Al — Demartini Metodu Seansı",
  "/contact": "İletişim — RE-SET, Şafak Özkan",
  "/privacy": "Gizlilik Politikası",
  "/kvkk": "KVKK Aydınlatma Metni",
  "/copyright": "Telif Hakkı",
  "/cookies": "Çerez Politikası",
};

// Yardımcı: path → meta (bilinmiyorsa ana sayfa meta'sına düş).
export function metaFor(path: string): RouteMeta {
  return ROUTE_META[path] || ROUTE_META["/"];
}
