import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import ReviewsSlider from '../../components/feature/ReviewsSlider';
import { servicesApi, contentApi, methodsApi } from '../../lib/api';
import type { ServiceType, HeroContent, AboutContent, ContactInfo, Method } from '../../types';



export default function HomePage() {
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
    const phoneNumber = (contactInfo?.phone || '+90 532 123 45 67').replace(/\D/g, '');
    const message = encodeURIComponent('Merhaba, danışmanlık hizmetleriniz hakkında bilgi almak istiyorum.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Hata durumu - Global hata yerine konsola yazıyoruz, UI devam ediyor.
  // Kritik hata (Hero yoksa) için render içinde kontrol edeceğiz.

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Reset - Şafak Özkan Demartini Metodu',
      description: 'İstanbul\'da Demartini Metodu uygulayıcısı. Değer belirleme, yaşam dengeleme ve kişisel dönüşüm danışmanlığı.',
      url: 'https://re-set.com.tr',
      telephone: contactInfo?.phone || '',
      email: contactInfo?.email || '',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'İstanbul',
        addressCountry: 'TR'
      },
      priceRange: '₺₺',
      openingHours: 'Mo-Fr 09:00-18:00',
      sameAs: [
        contactInfo?.instagram || '',
        contactInfo?.youtube || ''
      ].filter(Boolean),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Danışmanlık Hizmetleri',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Demartini Metodu Danışmanlığı',
              description: 'Dr. John Demartini tarafından geliştirilen değer belirleme ve yaşam dengeleme yöntemi'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Breakthrough Experience',
              description: 'Demartini Metodu ile 2 günlük yoğun yaşam dönüşümü programı'
            }
          }
        ]
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Şafak Özkan',
      jobTitle: 'Demartini Metodu Uygulayıcısı',
      worksFor: {
        '@type': 'Organization',
        name: 'Reset Danışmanlık'
      },
      knowsAbout: ['Demartini Metodu', 'Değer Belirleme', 'Yaşam Dengeleme', 'Breakthrough Experience', 'Kişisel Dönüşüm']
    }
  ];

  if (heroLoading) {
    return (
      <div className="bg-white">
        {/* Hero Skeleton */}
        <div className="relative min-h-[90vh] flex items-center bg-gray-50 overflow-hidden animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="max-w-xl">
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="flex gap-4">
                <div className="h-14 bg-gray-200 rounded-full w-40"></div>
                <div className="h-14 bg-gray-200 rounded-full w-48"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Skeletons for other sections if needed, but Hero is critical for 'First Paint' */}
        <div className="py-20 px-8 max-w-7xl mx-auto">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-10 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Reset - Şafak Özkan | Demartini Metodu İstanbul"
        description="İstanbul'da sertifikalı Demartini Metodu uygulayıcısı Şafak Özkan. Değerlerinizi keşfedin, hayat dengenizi bulun, potansiyelinizi ortaya çıkarın."
        keywords="demartini metodu, demartini metodu istanbul, demartini metodu türkiye, değer belirleme, breakthrough experience, şafak özkan, yaşam dengeleme"
        schema={schema}
      />

      {/* Hero Section */}
      {heroContent && (
        <section className="relative min-h-[90vh] flex items-start bg-gradient-to-br from-teal-50 via-white to-amber-50 overflow-hidden">
          {/* Hero Background Image with Progressive Loading */}
          {heroContent.image && (
            <div className="absolute inset-0 z-0">
              {/* Skeleton placeholder */}
              {!heroImageLoaded && (
                <div className="absolute inset-0 bg-gray-50 animate-pulse" />
              )}
              <img
                ref={heroImageRef}
                src={heroContent.image}
                alt="Hero Background"
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
                  style={{ color: heroContent.text_color || '#1A1A1A' }}
                >
                  {heroContent.title}
                </h1>
                <p
                  className="text-base md:text-lg lg:text-xl mb-8 leading-relaxed"
                  style={{ color: heroContent.text_color || '#4B5563' }}
                >
                  {heroContent.description}
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
                  Sertifikalı Demartini Metodu Uygulayıcısı
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
                      src={aboutContent.image}
                      alt="Şafak Özkan"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
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
                    {service.price && <span className="text-lg font-semibold text-[#D4AF37]">{service.price} ₺</span>}
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
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">Yöntemlerimiz</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Danışmanlık sürecimizde bilimsel temelli ve etkili yöntemler kullanıyoruz
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
                to="/methods"
                className="inline-block px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors shadow-lg"
              >
                Tüm Yöntemlerimiz
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewsSlider />

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
