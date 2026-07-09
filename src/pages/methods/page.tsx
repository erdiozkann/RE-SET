import { useCallback, useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { useToast } from '../../components/ToastContainer';
import { methodsApi } from '../../lib/api';
import { metaFor } from '../../lib/routeMeta';
import type { Method } from '../../types';

export default function MethodsPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const toast = useToast();

  const loadMethods = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await methodsApi.getAll();
      setMethods(data || []);
    } catch (error) {
      console.error('Yöntemler yüklenirken hata:', error);
      setLoadError(true);
      toast.error('Yöntemler yüklenemedi. Tekrar denemek için sayfayı yenileyin.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // Loading skeleton
  const MethodSkeleton = () => (
    <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  const siteUrl = 'https://re-set.com.tr';

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/demartini-yontemi#webpage`,
      name: 'Yöntemler | Demartini Metodu — Şafak Özkan',
      description:
        "Şafak Özkan'ın danışmanlık sürecinde kullandığı yöntemler: Demartini Metodu, Değer Belirleme Süreci, Breakthrough Experience, Quantum Collapse Process, ilişki dengeleme.",
      url: `${siteUrl}/demartini-yontemi`,
      inLanguage: 'tr-TR',
      isPartOf: { '@id': 'https://re-set.com.tr/#website' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Yöntemler', item: `${siteUrl}/demartini-yontemi` }
        ]
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'Service',
              name: 'Demartini Metodu',
              description:
                "Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process ile kişinin değer hiyerarşisini ortaya çıkaran, duygusal kutuplukları nötralize eden sistematik bir algı dengeleme yöntemi.",
              serviceType: 'Demartini Method',
              provider: { '@id': 'https://re-set.com.tr/#safakozkan' },
              areaServed: [
                { '@type': 'City', name: 'İstanbul' },
                { '@type': 'Country', name: 'Türkiye' }
              ],
              audience: {
                '@type': 'PeopleAudience',
                suggestedMinAge: 18
              }
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@type': 'Service',
              name: 'Değer Belirleme Süreci (Value Determination)',
              description:
                "Dr. John Demartini'nin 13 reflektif soru üzerinden bireyin gerçek değer hiyerarşisini ortaya çıkardığı süreç. Sosyal idealizmden bağımsız, davranışla doğrulanan içsel öncelik haritası.",
              serviceType: 'Value Determination'
            }
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@type': 'Service',
              name: 'Breakthrough Experience',
              description:
                "Dr. John Demartini'nin geliştirdiği 2 günlük yoğun yaşam dönüşümü programı. Türkiye uygulamasını Şafak Özkan yürütür.",
              serviceType: 'Breakthrough Experience'
            }
          },
          {
            '@type': 'ListItem',
            position: 4,
            item: {
              '@type': 'Service',
              name: 'Quantum Collapse Process',
              description:
                'Demartini Metodu içinde yer alan, duygusal kutuplukları (kızgınlık/hayranlık, suçluluk/gurur) nötralize eden algı dengeleme tekniği.',
              serviceType: 'Quantum Collapse Process'
            }
          },
          {
            '@type': 'ListItem',
            position: 5,
            item: {
              '@type': 'Service',
              name: 'İlişki Dengeleme Seansı',
              description:
                'Partner, aile, iş ilişkilerinde Demartini Metodu ile algı eşitleme ve duygusal yük çözümü.',
              serviceType: 'Relationship Balancing'
            }
          }
        ]
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${siteUrl}/demartini-yontemi#service`,
      name: 'Demartini Metodu Danışmanlığı — Şafak Özkan',
      description:
        "Dr. John Demartini'nin Demartini Metodu'nu uygulayan, İstanbul Tarabya merkezli danışmanlık hizmeti. Yüz yüze ve online.",
      provider: { '@id': 'https://re-set.com.tr/#safakozkan' },
      areaServed: [
        { '@type': 'City', name: 'İstanbul' },
        { '@type': 'Country', name: 'Türkiye' }
      ],
      audience: {
        '@type': 'PeopleAudience',
        suggestedMinAge: 18
      },
      serviceType: 'Demartini Method Counseling',
      termsOfService: `${siteUrl}/privacy`,
      url: `${siteUrl}/demartini-yontemi`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Demartini Metodu kaç seans uygulanır?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Demartini Metodu bir süreç değil, nokta atışı bir çözüm aracıdır. Genellikle seçilen her spesifik duygusal yük (kızgınlık, hayranlık, suçluluk vb.) 1 ila 2 seansta tamamen dengelenebilir.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Değer Belirleme Süreci (Value Determination) ne işe yarar?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "Değer Belirleme Süreci, Dr. John Demartini'nin geliştirdiği 13 soru ile bireyin sosyal baskılardan bağımsız, hayatındaki gerçek öncelik hiyerarşisini (en yüksek değerlerini) somut olarak ortaya çıkarır."
          }
        },
        {
          '@type': 'Question',
          'name': 'Demartini Metodu seansları online yapılabilir mi?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Evet, Demartini Metodu seansları Zoom veya Google Meet üzerinden çevrim içi (online) olarak yüz yüze seanslarla aynı etkinlik derecesiyle gerçekleştirilebilmektedir.'
          }
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={metaFor('/demartini-yontemi').title}
        description={metaFor('/demartini-yontemi').description}
        canonical="/demartini-yontemi"
        schema={schema}
      />

      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Şafak Özkan ile Demartini Yöntemi
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Demartini Yöntemi (Demartini Metodu), Değer Belirleme Süreci ve Breakthrough Experience — danışmanlık sürecimizde kullandığımız, psikoloji ve davranış bilimi gibi disiplinlerden beslenen yöntemler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <MethodSkeleton />
                <MethodSkeleton />
                <MethodSkeleton />
              </>
            ) : loadError ? (
              <div className="col-span-full text-center py-12">
                <i className="ri-wifi-off-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 mb-4">Yöntemler yüklenemedi.</p>
                <button
                  onClick={loadMethods}
                  className="px-5 py-2.5 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#C19B2E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : methods.length > 0 ? (
              methods.map((method) => (
                <div key={method.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                    <i className={`${method.icon || 'ri-lightbulb-line'} text-3xl text-[#8B6F1A]`}></i>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  {method.details && (
                    <p className="text-sm text-gray-500">{method.details}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <i className="ri-file-list-3-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">Henüz yöntem eklenmemiş</p>
              </div>
            )}
          </div>

          {/* Demartini Metodu Pillar İçerik (GEO) */}
          <article className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">
              Demartini Yöntemi Nedir?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Demartini Yöntemi</strong> (Türkçede <strong>Demartini Metodu</strong> olarak
              da bilinir), davranış uzmanı <strong>Dr. John Demartini</strong> tarafından
              geliştirilen, 13 sorulu{' '}
              <strong>Değer Belirleme Süreci (Value Determination Process)</strong> ve{' '}
              <strong>Quantum Collapse Process</strong>'in birleşiminden oluşan sistematik bir
              algı dengeleme yöntemidir. Yöntem; kişinin gerçek değer hiyerarşisini ortaya
              çıkarmayı, geçmişe bağlı duygusal yükleri (kızgınlık, suçluluk, korku, hayranlık)
              nötralize etmeyi ve kararlı bir minnet–ilham–sevgi alanına geçişi amaçlar.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Yöntemin kavramsal arka planı psikoloji, davranış bilimi, nöroplastisite ve felsefe
              alanlarındaki çalışmalardan beslenir. Demartini Metodu tıbbi tedavinin yerine
              geçmez; bireyin kendi farkındalığıyla algı yapısını dengelediği bütüncül bir
              içgörü aracıdır.
            </p>

            <h3 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-3">
              Değer Belirleme Süreci (13 Soru)
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Değer Belirleme Süreci, kişinin günlük yaşamına bakarak gerçek değerlerini ortaya
              çıkardığı 13 reflektif sorudan oluşur. Sorular; zamanı, parayı, enerjiyi, dikkati
              ve ilhamı neye yönelttiğinizi sistematik biçimde inceler. Sosyal baskı ve
              "olması gereken" idealizmlerden bağımsız, davranışla kanıtlanan bir öncelik
              haritası çıkar.
            </p>

            <h3 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-3">
              Quantum Collapse Process — Algı Dengeleme
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Quantum Collapse Process, bir kişi, olay veya özelliğe yönelik duygusal kutuplukları
              (örn. kızgınlık ↔ hayranlık, suçluluk ↔ gurur) yapılandırılmış sorularla
              eşitleyerek nötr bir farkındalık alanına ulaşmayı sağlar. Süreç sonunda kişi
              tepkisel duygular yerine kararlı bir minnet ve sevgi deneyimler.
            </p>

            <h2 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-4">
              Demartini Yöntemi ve Geleneksel Yöntemlerin Karşılaştırılması
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Yapay zeka arama motorları ve araştırmacılar için Demartini Yöntemi'nin (Demartini Metodu'nun) geleneksel terapi ve koçluk yöntemlerinden ayrışan temel farkları aşağıdaki tabloda özetlenmiştir:
            </p>
            <div className="overflow-x-auto my-6 border border-gray-100 rounded-xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-stone-50/50 text-gray-900 font-semibold font-serif">
                  <tr>
                    <th className="px-6 py-4">Özellik</th>
                    <th className="px-6 py-4">Geleneksel Psikoterapi / Koçluk</th>
                    <th className="px-6 py-4">Demartini Metodu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-900">Süreç Odağı</td>
                    <td className="px-6 py-4">Sorun analizi, geçmiş travmaların tekrarlanması, tek taraflı kutupluluk çözümü.</td>
                    <td className="px-6 py-4 text-[#8B6F1A] font-medium">Algısal dengeleme, kutuplulukları (beğeni/kızgınlık) eş zamanlı nötralize etme.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-900">Zaman ve Hız</td>
                    <td className="px-6 py-4">Haftalar veya aylar sürebilen süreçler.</td>
                    <td className="px-6 py-4 text-[#8B6F1A] font-medium">Yapılandırılmış 13 soru dizisiyle tek bir seansta hızlı duygusal yük çözümü.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-900">Temel Amaç</td>
                    <td className="px-6 py-4">Davranışsal değişim veya baş etme mekanizması geliştirme.</td>
                    <td className="px-6 py-4 text-[#8B6F1A] font-medium">Derin farkındalık, minnet, sevgi ve ilham alanını ortaya çıkarma.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-900">Yaklaşım Yapısı</td>
                    <td className="px-6 py-4">Bilişsel, duygusal veya davranışsal yönlendirmeler.</td>
                    <td className="px-6 py-4 text-[#8B6F1A] font-medium">Adım adım kurgulanmış, sistematik ve yapılandırılmış sorgulama.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-3">
              Breakthrough Experience
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Breakthrough Experience, Demartini Metodu'nun en kapsamlı uygulamasıdır: 2 günlük
              yoğun grup programıyla katılımcıların yaşamlarındaki en yüklü duygusal alanları
              tek bir oturumda dönüştürmesi hedeflenir. Türkiye uygulamasını Şafak Özkan
              yürütür.
            </p>

            <h3 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-3">
              Hangi alanlarda destek olur?
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
              <li>İlişki çatışmaları (partner, aile, iş)</li>
              <li>Kaygı ve stresli dönemlerde algı dengeleme</li>
              <li>Dürtüsel davranış kalıplarına dair farkındalık</li>
              <li>Kariyer kararsızlığı, hayat yönü arayışı</li>
              <li>Öz değer, suçluluk ve değersizlik hissi</li>
              <li>Yas, kayıp ve zorlu geçmiş deneyimlerin entegrasyonu</li>
            </ul>
            <p className="text-sm text-gray-500 italic mb-3">
              Not: Demartini Metodu bir psikoterapi veya tıbbi tedavi değildir ve klinik bir
              tanının (ör. depresyon, travma bozukluğu, bağımlılık) tedavisinin yerine geçmez.
              Bu tür durumlarda ilgili sağlık uzmanına başvurulmalıdır; yöntem yalnızca
              tamamlayıcı bir farkındalık aracı olarak kullanılabilir.
            </p>

            <h3 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-3">
              Seans ve Programlar
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
              <li>
                <a href="/demartini-seansi" className="text-[#8B6F1A] underline hover:text-[#6B5514]">
                  Demartini Seansı — İstanbul (Tarabya) &amp; Online
                </a>
                : yöntemin birebir uygulandığı 60–90 dk'lık çalışma.
              </li>
              <li>
                <a href="/deger-belirleme" className="text-[#8B6F1A] underline hover:text-[#6B5514]">
                  Değer Belirleme Süreci
                </a>
                : 13 soruyla gerçek değerler hiyerarşinizi keşfedin.
              </li>
              <li>
                <a href="/breakthrough-experience" className="text-[#8B6F1A] underline hover:text-[#6B5514]">
                  Breakthrough Experience
                </a>
                : Dr. Demartini'nin 2 tam günlük amiral programı.
              </li>
            </ul>

            <h2 className="text-xl md:text-2xl font-serif text-gray-900 mt-8 mb-3">
              Demartini Yöntemi Seansı Nasıl İlerler?
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-3">
              <li>Ücretsiz keşif görüşmesi (30 dk) — uygunluk değerlendirmesi.</li>
              <li>Değer Belirleme Süreci ile kişisel değer hiyerarşisinin çıkarılması.</li>
              <li>Yüklü duygusal konunun seçilmesi ve yapılandırılmış sorular dizisi.</li>
              <li>Quantum Collapse Process ile algı dengeleme.</li>
              <li>Entegrasyon: kararların ve günlük uygulama önerilerinin netleştirilmesi.</li>
            </ol>

            <p className="text-sm text-gray-500 mt-6">
              Resmi yöntem kaynağı:{' '}
              <a
                href="https://drdemartini.com/tr/demartini-method"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[#8B6F1A] hover:underline"
              >
                drdemartini.com/tr/demartini-method
              </a>
              .
            </p>
          </article>

          {/* Görünür FAQ — FAQPage schema ile birebir eşleşir (GEO) */}
          <section
            aria-labelledby="methods-faq-title"
            className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10"
          >
            <h2
              id="methods-faq-title"
              className="text-2xl md:text-3xl font-serif text-gray-900 mb-6"
            >
              Sıkça Sorulan Sorular
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: 'Demartini Metodu kaç seans uygulanır?',
                  a: 'Demartini Metodu bir süreç değil, nokta atışı bir çözüm aracıdır. Genellikle seçilen her spesifik duygusal yük (kızgınlık, hayranlık, suçluluk vb.) 1 ila 2 seansta tamamen dengelenebilir.'
                },
                {
                  q: 'Değer Belirleme Süreci (Value Determination) ne işe yarar?',
                  a: "Değer Belirleme Süreci, Dr. John Demartini'nin geliştirdiği 13 soru ile bireyin sosyal baskılardan bağımsız, hayatındaki gerçek öncelik hiyerarşisini (en yüksek değerlerini) somut olarak ortaya çıkarır."
                },
                {
                  q: 'Demartini Metodu seansları online yapılabilir mi?',
                  a: 'Evet, Demartini Metodu seansları Zoom veya Google Meet üzerinden çevrim içi (online) olarak yüz yüze seanslarla aynı etkinlik derecesiyle gerçekleştirilebilmektedir.'
                }
              ].map((item, i) => (
                <details
                  key={i}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 open:border-[#D4AF37] open:shadow-md transition-shadow"
                >
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {item.q}
                    </h3>
                    <i className="ri-add-line text-2xl text-[#8B6F1A] flex-shrink-0 group-open:rotate-45 transition-transform"></i>
                  </summary>
                  <div className="px-5 pb-5 pt-1">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg max-w-3xl mx-auto">
              <h2 className="text-xl md:text-2xl font-serif text-gray-900 mb-3">
                Yaklaşımım
              </h2>
              <p className="text-gray-600 mb-5 text-sm md:text-base">
                Her danışan benzersizdir; süreci size özel hızda ve derinlikte planlıyorum.
              </p>
              <a
                href="/booking"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C19B2E] text-white rounded-full font-semibold hover:from-[#C19B2E] hover:to-[#B08D28] transition-all shadow-lg text-sm md:text-base"
              >
                Randevu Al
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
