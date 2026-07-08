import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import ReviewsSlider from '../../components/feature/ReviewsSlider';
import { servicesApi, contentApi, methodsApi } from '../../lib/api';
import type { ServiceType, HeroContent, AboutContent, ContactInfo, Method } from '../../types';
import { FAQ } from '../../data/faq';
import { optimizedImage } from '../../lib/img';
import { metaFor } from '../../lib/routeMeta';



export default function HomePage() {
  const navigate = useNavigate();
  /* Supabase Only Data Flow */
  const [services, setServices] = useState<ServiceType[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  // Loading states
  const [heroLoading, setHeroLoading] = useState(true);

  // Hero image loading state
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const heroImageRef = useRef<HTMLImageElement>(null);



  const loadData = useCallback(() => {
    // Independent data fetching for progressive rendering
    // 1. Hero Content (Critical Priority)
    setHeroLoading(true);
    contentApi.getHeroContents()
      .then(data => {
        if (data && data.length > 0) {
          setHeroContent(data[0]);
        }
      })
      .catch(err => console.error('Hero Load Error:', err))
      .finally(() => setHeroLoading(false));

    // 2. Contact Info (High Priority for Header/CTA)
    contentApi.getContactInfo()
      .then(data => data && setContactInfo(data))
      .catch(err => console.error('Contact Load Error:', err));

    // 3. About Content
    contentApi.getAboutContents()
      .then(data => {
        if (data && data.length > 0) setAboutContent(data[0]);
      })
      .catch(err => console.error('About Load Error:', err));

    // 4. Services
    servicesApi.getAll()
      .then(data => setServices(data || []))
      .catch(err => console.error('Services Load Error:', err));

    // 5. Methods
    methodsApi.getAll()
      .then(data => setMethods(data || []))
      .catch(err => console.error('Methods Load Error:', err));

  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleWhatsAppClick = () => {
    // Gerçek numara yoksa SAHTE numaraya WhatsApp açma (eski placeholder
    // +90 532 123 45 67 kaldırıldı) → iletişim sayfasına yönlendir.
    const phoneNumber = (contactInfo?.phone || '').replace(/\D/g, '');
    if (!phoneNumber) {
      navigate('/contact');
      return;
    }
    const message = encodeURIComponent('Merhaba, danışmanlık hizmetleriniz hakkında bilgi almak istiyorum.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Hata durumu - Global hata yerine konsola yazıyoruz, UI devam ediyor.
  // Kritik hata (Hero yoksa) için render içinde kontrol edeceğiz.

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': 'https://re-set.com.tr/#service',
      name: 'RE-SET — Şafak Özkan Demartini Metodu',
      alternateName: ['RE-SET Danışmanlık', 'Demartini Metodu İstanbul'],
      description:
        "İstanbul'da Dr. John Demartini'nin Demartini Yöntemi'ni uygulayan danışmanlık. Değer belirleme, ilişki dengeleme, Breakthrough Experience ve kişisel dönüşüm seansları.",
      url: 'https://re-set.com.tr/',
      image: 'https://re-set.com.tr/og-image.jpg',
      telephone: contactInfo?.phone || '',
      email: contactInfo?.email || '',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'İstanbul',
        addressRegion: 'İstanbul',
        addressCountry: 'TR'
      },
      areaServed: [
        { '@type': 'City', name: 'İstanbul' },
        { '@type': 'Country', name: 'Türkiye' }
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        }
      ],
      provider: { '@id': 'https://re-set.com.tr/#safakozkan' },
      founder: { '@id': 'https://re-set.com.tr/#safakozkan' },
      sameAs: [
        contactInfo?.instagram || '',
        contactInfo?.youtube || '',
        'https://drdemartini.com/tr/demartini-method'
      ].filter(Boolean),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Danışmanlık Hizmetleri',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Demartini Metodu Birebir Seans',
              serviceType: 'Demartini Method Session',
              description:
                "Dr. John Demartini tarafından geliştirilen 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process ile birebir algı dengeleme seansı."
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Breakthrough Experience',
              serviceType: 'Breakthrough Experience Program',
              description:
                'Demartini Metodu ile 2 günlük yoğun yaşam dönüşümü programı (Türkiye uygulaması).'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'İlişki Dengeleme Seansı',
              serviceType: 'Relationship Balancing',
              description:
                'Partner, aile ve iş ilişkilerinde Demartini Metodu ile algı dengeleme.'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Online Demartini Seansı',
              serviceType: 'Online Session',
              description:
                'Zoom/Google Meet üzerinden yüz yüze eşdeğer Demartini Metodu seansı.'
            }
          },
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TRY',
            itemOffered: {
              '@type': 'Service',
              name: 'Ücretsiz Keşif Görüşmesi (30 dk)',
              description:
                'Birlikte çalışıp çalışamayacağımızı değerlendirmek için 30 dakikalık ön görüşme.'
            }
          }
        ]
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://re-set.com.tr/#safakozkan',
      name: 'Şafak Özkan',
      jobTitle: 'Eğitimli Demartini Yöntemi Uygulayıcısı',
      url: 'https://re-set.com.tr/about',
      worksFor: { '@id': 'https://re-set.com.tr/#organization' },
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Demartini Method Facilitator',
        occupationLocation: { '@type': 'City', name: 'İstanbul' }
      },
      knowsAbout: [
        'Demartini Metodu',
        'Değer Belirleme Süreci',
        'Yaşam Dengeleme',
        'Breakthrough Experience',
        'Quantum Collapse Process',
        'İlişki Dengeleme',
        'Kişisel Dönüşüm'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    }
  ];

  // heroLoading iken TÜM sayfayı gri skeleton'a çevirmek, prerendered içeriğin
  // görünüp sonra kaybolup geri gelmesine (flaş) yol açıyordu = yavaş hissi.
  // Onun yerine hero'yu statik fallback ile hemen render ediyoruz; gerçek
  // içerik Supabase'ten gelince sorunsuz güncelleniyor.
  const hero: HeroContent = heroContent || {
    id: 'fallback',
    title: 'Kendinle Başla',
    description:
      'Bireylerin öz güçlerini hatırlamalarına, potansiyellerini gerçekleştirmelerine ve yaşamlarını bilinçle yeniden tasarlamalarına ilham olmak.',
    location: '',
    titleSize: '',
    descriptionSize: '',
    image: '',
    text_color: '',
  };

  return (
    <>
      <SEO
        title={metaFor('/').title}
        description={metaFor('/').description}
        canonical="/"
        schema={schema}
      />

      {/* Hero Section — her zaman render olur (fallback ile), flaş yok */}
      {(
        <section className="relative min-h-[90vh] flex items-start bg-gradient-to-br from-teal-50 via-white to-amber-50 overflow-hidden">
          {/* Hero Background Image with Progressive Loading */}
          {hero.image && (
            <div className="absolute inset-0 z-0">
              {/* Skeleton placeholder */}
              {!heroImageLoaded && (
                <div className="absolute inset-0 bg-gray-50 animate-pulse" />
              )}
              <img
                ref={heroImageRef}
                src={optimizedImage(hero.image, { width: 1400 })}
                alt="Şafak Özkan ile Demartini Metodu danışmanlığı — RE-SET İstanbul"
                className={`w-full h-full object-cover object-top transition-opacity duration-700 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                onLoad={() => setHeroImageLoaded(true)}
                onError={() => {
                  setHeroImageLoaded(false);
                }}
              />
            </div>
          )}

          {/* Content Container - Sol üst köşeye hizalanmış */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-24 md:pt-32">
            <div className="max-w-xl">
              {/* Glassmorphism Container */}
              <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                  style={{ color: hero.text_color || '#1A1A1A' }}
                >
                  <span className="block text-base md:text-lg font-semibold tracking-wide text-[#C19B2E] mb-2">
                    Demartini Yöntemi (Metodu) · Şafak Özkan · İstanbul
                  </span>
                  {hero.title}
                </h1>
                <p
                  className="text-base md:text-lg lg:text-xl mb-8 leading-relaxed"
                  style={{ color: hero.text_color || '#4B5563' }}
                >
                  {hero.description}
                </p>

                {/* Butonlar */}
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <Link
                    to="/booking"
                    className="px-8 py-4 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-all shadow-lg hover:shadow-xl text-lg hover:scale-105"
                  >
                    Randevu Al
                  </Link>
                  <button
                    onClick={handleWhatsAppClick}
                    className="px-8 py-4 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-lg hover:scale-105"
                  >
                    <i className="ri-whatsapp-line text-xl"></i>
                    WhatsApp ile İletişim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {aboutContent && (
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F5F5] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1A1A1A] mb-4 leading-tight">
                  {aboutContent.title}
                </h2>
                <p className="text-lg md:text-xl text-[#D4AF37] mb-4 font-medium">
                  Eğitimli Demartini Yöntemi Uygulayıcısı
                </p>
                <p className="text-base text-gray-600 leading-relaxed mb-3">
                  {aboutContent.paragraph1}
                </p>
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  {aboutContent.paragraph2}
                </p>
                <Link
                  to="/about"
                  className="inline-block px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors"
                >
                  Daha Fazla Bilgi
                </Link>
              </div>
              <div className="relative flex justify-center">
                <div className="aspect-square w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-gray-100 flex items-center justify-center">
                  {aboutContent.image ? (
                    <img
                      src={optimizedImage(aboutContent.image, { width: 800, height: 800, resize: 'cover' })}
                      alt="Şafak Özkan"
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <i className="ri-user-smile-line text-6xl text-gray-300"></i>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-900 mb-8">Hizmetlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span><i className="ri-time-line mr-1"></i>{service.duration} dakika</span>
                  </div>
                  <Link
                    to="/booking"
                    className="block w-full text-center px-4 py-2.5 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors text-sm"
                  >
                    Randevu Al
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Methods Section */}
      {methods.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">Demartini Yöntemi ve Yöntemlerimiz</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Danışmanlık sürecimizde psikoloji ve davranış bilimi gibi disiplinlerden beslenen yöntemler kullanıyoruz
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-[#D4AF37] hover:shadow-xl transition-all group"
                >
                  {method.icon && (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#C19B2E] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <i className={`${method.icon} text-2xl text-white`}></i>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{method.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{method.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/demartini-yontemi"
                className="inline-block px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors shadow-lg"
              >
                Tüm Yöntemlerimiz
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Demartini Metodu — Entity tanım bloğu (GEO) */}
      <section
        aria-labelledby="what-is-demartini"
        className="py-12 md:py-16 bg-white border-t border-gray-100"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="what-is-demartini"
            className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-6 text-center"
          >
            Demartini Yöntemi Nedir?
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-5">
            <strong>Demartini Yöntemi</strong> (Türkçede <strong>Demartini Metodu</strong> olarak
            da bilinir), Dr. John Demartini tarafından geliştirilen, 13 sorulu
            <strong> Değer Belirleme Süreci</strong> ve <strong>Quantum Collapse Process</strong>
            'in birleşiminden oluşan sistematik bir algı dengeleme yöntemidir. Kişinin gerçek değer
            hiyerarşisini ortaya çıkarmayı; kızgınlık–hayranlık, suçluluk–gurur gibi duygusal
            kutuplukları nötralize ederek minnet, ilham ve sevgi alanına geçişi sağlamayı hedefler.
          </p>
          <p className="text-base text-gray-700 leading-relaxed mb-5">
            Yöntem; psikoloji, davranış bilimi, nöroplastisite ve felsefe alanlarındaki
            araştırmalardan beslenir. Tıbbi tedavinin yerine geçmez; danışanın kendi
            farkındalığıyla algı yapısını dengelediği bütüncül bir araçtır.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Kim geliştirdi?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                İnsan davranışı uzmanı Dr. John Demartini, 50+ yıllık araştırması üzerine kurmuştur.
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-white p-5 rounded-2xl border border-teal-100">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Kimler için uygundur?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                İlişki çatışmaları, öz değer, kariyer kararsızlığı ve zorlu yaşam geçişleri yaşayan 18+ herkes için.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Nasıl uygulanır?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Birebir 60–90 dk seanslar veya 2 günlük Breakthrough Experience programı.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSlider />

      {/* Sıkça Sorulan Sorular — Görünür FAQ (GEO) */}
      <section
        aria-labelledby="faq-title"
        className="py-12 md:py-16 bg-gradient-to-br from-[#F5F5F5] to-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 id="faq-title" className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-3">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-base text-gray-600">
              Demartini Metodu ve seans süreci hakkında merak edilenler
            </p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-gray-200 open:border-[#D4AF37]/40 open:shadow-md transition-shadow"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4">
                  <h3 className="text-base md:text-lg font-semibold text-[#1A1A1A]">
                    {item.q}
                  </h3>
                  <i className="ri-add-line text-2xl text-[#D4AF37] flex-shrink-0 group-open:rotate-45 transition-transform"></i>
                </summary>
                <div className="px-5 pb-5 pt-1">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Hayatınızı Dönüştürmeye Hazır mısınız?</h2>
          <p className="text-lg md:text-xl mb-6">İlk danışmanlık seansınızı hemen planlayın</p>
          <Link
            to="/booking"
            className="inline-block px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors shadow-lg"
          >
            Randevu Al
          </Link>
        </div>
      </section>
    </>
  );
}
