import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { metaFor, ROUTE_HEADING } from '../../lib/routeMeta';
import {
  SEANS_INTRO, SEANS_FAQ,
  DEGER_INTRO, DEGER_FAQ,
  BREAKTHROUGH_INTRO, BREAKTHROUGH_FAQ,
  type FaqItem,
} from '../../data/serviceFaqs';

// Para sayfaları (hizmet-niyetli landing'ler) — primordial sayfasıyla aynı desen:
// görünür içerik = FAQPage schema (tek kaynak: data/serviceFaqs.ts), Service +
// BreadcrumbList JSON-LD, klinik-olmayan dil + disclaimer, fiyat YOK.

type ServiceConfig = {
  path: string;
  serviceName: string;
  alternateNames: string[];
  intro: string[];
  bullets: { heading: string; items: string[] };
  faq: FaqItem[];
};

const CONFIGS: Record<string, ServiceConfig> = {
  'demartini-seansi': {
    path: '/demartini-seansi',
    serviceName: 'Demartini Seansı (Birebir)',
    alternateNames: ['Demartini Metodu Seansı', 'Demartini Yöntemi Seansı', 'Demartini İstanbul'],
    intro: SEANS_INTRO,
    bullets: {
      heading: 'Seansta neler olur?',
      items: [
        'Gündeminizdeki konu netleştirilir (ilişki, öz değer, kariyer, yas, karar…)',
        '13 sorulu Değer Belirleme Süreci ile değerler hiyerarşiniz çıkarılır',
        'Quantum Collapse Process ile konudaki duygusal kutupluluklar dengelenir',
        'Seans 60–90 dk sürer; konuya göre 2–6 seanslık süreç önerilebilir',
        "İstanbul Tarabya'da yüz yüze veya Zoom/Google Meet ile online",
      ],
    },
    faq: SEANS_FAQ,
  },
  'deger-belirleme': {
    path: '/deger-belirleme',
    serviceName: 'Değer Belirleme Süreci',
    alternateNames: ['Value Determination Process', 'Değerler Hiyerarşisi Çalışması', '13 Soru'],
    intro: DEGER_INTRO,
    bullets: {
      heading: 'Bu çalışma size ne kazandırır?',
      items: [
        'Sosyal beklentilerden arınmış, davranışla doğrulanan değer sıralamanız',
        'Kariyer ve öncelik kararlarında kişisel pusula',
        'Motivasyon ve ertelemenin değerlerinizle ilişkisini görme',
        'İlişkilerde karşı tarafın değer hiyerarşisini okuyabilme',
        "Demartini Yöntemi'nin sonraki adımları için temel",
      ],
    },
    faq: DEGER_FAQ,
  },
  'breakthrough-experience': {
    path: '/breakthrough-experience',
    serviceName: 'Breakthrough Experience',
    alternateNames: ['Demartini Breakthrough Experience', '2 Günlük Demartini Programı'],
    intro: BREAKTHROUGH_INTRO,
    bullets: {
      heading: 'Program akışı',
      items: [
        "Dr. John Demartini'nin geliştirdiği 2 tam günlük amiral program",
        'Değer Belirleme Süreci: gerçek değer hiyerarşinizin çıkarılması',
        'Quantum Collapse Process: seçtiğiniz konuda kutuplulukların dengelenmesi',
        'Kendi gerçek konunuz üzerinde uygulamalı çalışma',
        'Uygunluk ve kapsam, ücretsiz keşif görüşmesinde birlikte planlanır',
      ],
    },
    faq: BREAKTHROUGH_FAQ,
  },
};

export default function ServicePage({ slug }: { slug: keyof typeof CONFIGS }) {
  const cfg = CONFIGS[slug];
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';
  const meta = metaFor(cfg.path);
  const h1 = ROUTE_HEADING[cfg.path] || meta.title;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${siteUrl}${cfg.path}#service`,
      name: cfg.serviceName,
      alternateName: cfg.alternateNames,
      serviceType: 'Kişisel gelişim danışmanlığı (Demartini Yöntemi)',
      description: meta.description,
      url: `${siteUrl}${cfg.path}`,
      areaServed: [
        { '@type': 'City', name: 'İstanbul' },
        { '@type': 'Country', name: 'Türkiye' },
      ],
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceLocation: {
          '@type': 'Place',
          name: 'RE-SET — Tarabya, İstanbul',
          address: { '@type': 'PostalAddress', addressLocality: 'İstanbul', addressCountry: 'TR' },
        },
      },
      provider: {
        '@type': 'Person',
        name: 'Şafak Özkan',
        url: `${siteUrl}/about`,
        jobTitle: 'Eğitimli Demartini Yöntemi Uygulayıcısı',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Demartini Yöntemi', item: `${siteUrl}/demartini-yontemi` },
        { '@type': 'ListItem', position: 3, name: cfg.serviceName, item: `${siteUrl}${cfg.path}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: cfg.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <>
      <SEO
        title={meta.title}
        description={meta.description}
        canonical={cfg.path}
        schema={schema}
      />

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{h1}</h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">{meta.description}</p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            {cfg.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}

            <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-3">{cfg.bullets.heading}</h2>
            <ul className="list-disc list-inside space-y-1">
              {cfg.bullets.items.map((it) => (
                <li key={it.slice(0, 24)}>{it}</li>
              ))}
            </ul>

            <p className="text-sm text-gray-500 italic mt-6">
              Not: Demartini Yöntemi bir psikoterapi veya tıbbi tedavi değildir ve klinik bir
              tanının tedavisinin yerine geçmez. Bu tür durumlarda ilgili sağlık uzmanına
              başvurulmalıdır; yöntem tamamlayıcı bir farkındalık aracı olarak kullanılabilir.
            </p>

            <h2 className="text-2xl font-serif text-gray-900 mt-10 mb-4">Sıkça Sorulan Sorular</h2>
            <div className="space-y-6">
              {cfg.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.q}</h3>
                  <p className="text-gray-700">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/booking"
                className="inline-block px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors font-medium"
              >
                Ücretsiz Keşif Görüşmesi Planla
              </Link>
              <Link
                to="/contact"
                className="inline-block px-6 py-3 border border-[#D4AF37] text-[#8B6F1A] rounded-lg hover:bg-[#D4AF37]/10 transition-colors font-medium"
              >
                Soru Sor / İletişim
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Ayrıca bkz: <Link to="/demartini-yontemi" className="underline">Demartini Yöntemi nedir?</Link>
              {' · '}
              <Link to="/primordial-ses-meditasyonu" className="underline">Primordial Ses Meditasyonu</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
