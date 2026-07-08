import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { metaFor } from '../../lib/routeMeta';
import { PRIMORDIAL_FAQ } from '../../data/primordialFaq';

// Primordial Ses (Sound) Meditasyonu — RE-SET'in 2. ana uzmanlık dikeyi.
// Görünür FAQ ile FAQPage schema, tek kaynaktan (data/primordialFaq.ts) gelir →
// prerender statik gövdesiyle de birebir aynı (cloaking yok, H9 uyumlu).
// İçerik dürüst ve ölçülüdür: sağlık/tıbbi iyileşme iddiası YOK, disclaimer var.

export default function PrimordialPage() {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';
  const meta = metaFor('/primordial-ses-meditasyonu');

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${siteUrl}/primordial-ses-meditasyonu#service`,
      name: 'Primordial Ses (Sound) Meditasyonu',
      alternateName: ['Mantra Meditasyonu', 'Primordial Sound Meditation'],
      serviceType: 'Meditasyon eğitimi ve uygulaması',
      description: meta.description,
      url: `${siteUrl}/primordial-ses-meditasyonu`,
      areaServed: { '@type': 'Country', name: 'Türkiye' },
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceLocation: {
          '@type': 'Place',
          name: 'RE-SET — Tarabya, İstanbul',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'İstanbul',
            addressRegion: 'İstanbul',
            addressCountry: 'TR',
          },
        },
      },
      provider: {
        '@type': 'Person',
        name: 'Şafak Özkan',
        url: `${siteUrl}/about`,
        jobTitle: 'Primordial Ses Meditasyonu Eğitmeni',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PRIMORDIAL_FAQ.map((f) => ({
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
        canonical="/primordial-ses-meditasyonu"
        schema={schema}
      />

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Primordial Ses (Sound) Meditasyonu
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Kişiye özel mantra ile sessiz meditasyon. İstanbul/Tarabya'da eğitmen Şafak Özkan
              ile yüz yüze ve online mantra meditasyonu eğitimi.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-3">
              Primordial Ses Meditasyonu Nedir?
            </h2>
            <p>
              Primordial Ses Meditasyonu, Vedik gelenekten gelen, kişiye özel bir mantranın
              (ses) sessizce tekrar edildiği bir meditasyon uygulamasıdır. Mantra, kişinin doğum
              zamanı ve yerine göre belirlenen, anlamı olmayan nötr bir sestir. Amaç, zihni
              düşünce akışından zorlamadan uzaklaştırıp bir sükûnet ve iç dinginlik alanına
              getirmektir.
            </p>
            <p>
              Şafak Özkan, Demartini Yöntemi'nin yanı sıra Primordial Ses Meditasyonu eğitimi de
              almıştır ve bu iki yaklaşımı danışanın ihtiyacına göre birlikte kullanır.
            </p>

            <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-3">Nasıl Uygulanır?</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Kişiye özel mantra, Vedik hesaplama geleneğine göre belirlenir.</li>
              <li>Genellikle günde iki kez, 20–30 dakika, sessizce oturarak uygulanır.</li>
              <li>Mantra zorlamadan tekrar edilir; düşünce geldiğinde nazikçe mantraya dönülür.</li>
              <li>Öğrenme süreci birebir eğitim ile aktarılır.</li>
            </ul>

            <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-3">Kimler İçin Uygundur?</h2>
            <p>
              Meditasyon deneyimi olsun olmasın, gündelik yoğunlukta bir sükûnet ve odak pratiği
              arayan herkes için uygundur. Belirli bir dinî inanç gerektirmez.
            </p>

            <p className="text-sm text-gray-500 italic mt-6">
              Not: Primordial Ses Meditasyonu bir sağlık hizmeti, psikoterapi veya tıbbi tedavi
              değildir ve herhangi bir hastalığın tedavisi olarak sunulmaz. Klinik bir durumda
              ilgili sağlık uzmanına başvurulmalıdır.
            </p>

            <h2 className="text-2xl font-serif text-gray-900 mt-10 mb-4">Sıkça Sorulan Sorular</h2>
            <div className="space-y-6">
              {PRIMORDIAL_FAQ.map((f) => (
                <div key={f.q}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.q}</h3>
                  <p className="text-gray-700">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/booking"
                className="inline-block px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors font-medium"
              >
                Keşif Görüşmesi / Randevu Al
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
