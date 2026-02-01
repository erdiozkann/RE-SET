import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import ReviewsSlider from '../../components/feature/ReviewsSlider';
import { servicesApi, contentApi, methodsApi } from '../../lib/api';
import type { ServiceType, HeroContent, AboutContent, ContactInfo, Method } from '../../types';

export default function HomePage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Hero image loading state
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const heroImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadData();

    // Preload hero image
    if (heroImageRef.current?.complete && heroImageRef.current?.naturalHeight !== 0) {
      setHeroImageLoaded(true);
    }
  }, []);

  const loadData = async () => {
    console.log('🔄 Data loading started...');

    const fetchData = async () => {
      try {
        console.log('📡 Fetching services...');
        const servicesData = await servicesApi.getAll();
        console.log('✅ Services fetched:', servicesData?.length);
        setServices(servicesData || []);

        console.log('📡 Fetching methods...');
        const methodsData = await methodsApi.getAll();
        console.log('✅ Methods fetched:', methodsData?.length);
        setMethods(methodsData || []);

        console.log('📡 Fetching hero content...');
        const heroData = await contentApi.getHeroContents();
        console.log('✅ Hero fetched:', heroData?.length, 'items');
        if (heroData && heroData.length > 0) setHeroContent(heroData[0]);

        console.log('📡 Fetching about content...');
        const aboutData = await contentApi.getAboutContents();
        console.log('✅ About fetched:', aboutData?.length, 'items');
        if (aboutData && aboutData.length > 0) setAboutContent(aboutData[0]);

        console.log('📡 Fetching contact info...');
        const contactData = await contentApi.getContactInfo();
        console.log('✅ Contact fetched:', contactData);
        if (contactData) setContactInfo(contactData);

      } catch (error) {
        console.error('❌ Data loading critical error:', error);
      }
    };

    // Race between data fetching and a 10-second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Data loading timed out (10s)')), 10000);
    });

    try {
      await Promise.race([fetchData(), timeoutPromise]);
    } catch (error) {
      console.warn('⚠️ Data loading finished with warnings or timeout:', error);
    } finally {
      console.log('🏁 Loading finished, unblocking UI.');
      setLoading(false);
    }
  };


  const handleWhatsAppClick = () => {
    const phoneNumber = (contactInfo?.phone || '+90 532 123 45 67').replace(/\D/g, '');
    const message = encodeURIComponent('Merhaba, danışmanlık hizmetleriniz hakkında bilgi almak istiyorum.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Varsayılan değerler
  const defaultHero = {
    title: 'Demartini Metodu ile Hayatınızı Dönüştürün',
    description: 'İstanbul\'da sertifikalı Demartini Metodu uygulayıcısı Şafak Özkan ile değerlerinizi keşfedin, hayat dengenizi bulun.',
    image: '', // Kullanıcı isteği: Sadece admin panelinden eklenen resim görünsün, varsayılan olmasın
    text_color: '#1A1A1A'
  };

  const defaultAbout = {
    title: 'Şafak Özkan',
    paragraph1: '15 yılı aşkın deneyimimle, bireylerin ve çiftlerin yaşamlarında anlamlı değişimler yaratmalarına yardımcı oluyorum.',
    paragraph2: 'Amacım, sizin içsel gücünüzü keşfetmenize ve hayallerinize ulaşmanız için gerekli araçları edinmenize yardımcı olmak.',
    image: '' // Varsayılan resim kaldırıldı
  };

  // Yükleme durumu
  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-teal-600 animate-spin mb-4"></i>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanılacak veriler (veritabanından veya varsayılan)
  const displayHero = heroContent || defaultHero;
  const displayAbout = aboutContent || defaultAbout;

  // Resimler için fallback zinciri
  const heroImage = displayHero.image || defaultHero.image;
  const aboutImage = displayAbout.image || defaultAbout.image;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Reset - Şafak Özkan Demartini Metodu',
      description: 'İstanbul\'da Demartini Metodu uygulayıcısı. Değer belirleme, yaşam dengeleme ve kişisel dönüşüm danışmanlığı.',
      url: 'https://re-set.com.tr',
      telephone: contactInfo?.phone || '+90 532 123 45 67',
      email: contactInfo?.email || 'info@re-set.com.tr',
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

  return (
    <>
      <SEO
        title="Reset - Şafak Özkan | Demartini Metodu İstanbul"
        description="İstanbul'da sertifikalı Demartini Metodu uygulayıcısı Şafak Özkan. Değerlerinizi keşfedin, hayat dengenizi bulun, potansiyelinizi ortaya çıkarın."
        keywords="demartini metodu, demartini metodu istanbul, demartini metodu türkiye, değer belirleme, breakthrough experience, şafak özkan, yaşam dengeleme"
        schema={schema}
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 overflow-hidden">
        {/* Hero Background Image with Progressive Loading */}
        {heroImage && (
          <div className="absolute inset-0 z-0">
            {/* Skeleton placeholder */}
            {!heroImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            )}
            <img
              ref={heroImageRef}
              src={heroImage}
              alt="Hero Background"
              className={`w-full h-full object-cover transition-opacity duration-700 ${heroImageLoaded ? 'opacity-100 hero-image-loaded' : 'opacity-0'
                }`}
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              onLoad={() => setHeroImageLoaded(true)}
              onError={() => {
                console.error('Hero image failed to load:', heroImage);
                // Sadece opacity 0 kalsın, display none yapma ki düzelirse görünsün
                setHeroImageLoaded(false);
              }}
            />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1
            className="text-4xl md:text-5xl font-serif mb-4"
            style={{ color: displayHero.text_color || '#1A1A1A' }}
          >
            {displayHero.title}
          </h1>
          <p
            className="text-lg md:text-xl mb-6 max-w-2xl mx-auto"
            style={{ color: displayHero.text_color || '#4B5563' }}
          >
            {displayHero.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-all shadow-lg hover:shadow-xl"
            >
              Randevu Al
            </Link>
            <button
              onClick={handleWhatsAppClick}
              className="px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <i className="ri-whatsapp-line text-xl"></i>
              WhatsApp ile İletişim
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F5F5] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1A1A1A] mb-4 leading-tight">
                {displayAbout.title}
              </h2>
              <p className="text-lg md:text-xl text-[#D4AF37] mb-4 font-medium">
                Sertifikalı Demartini Metodu Uygulayıcısı
              </p>
              <p className="text-base text-gray-600 leading-relaxed mb-3">
                {displayAbout.paragraph1}
              </p>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                {displayAbout.paragraph2}
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
                {aboutImage ? (
                  <img
                    src={aboutImage}
                    alt="Şafak Özkan"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <i className="ri-user-smile-line text-6xl text-gray-300"></i>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


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
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">Kullandığımız Yöntemler</h2>
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
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Hayalinizdeki Yaşama İlk Adımı Atın</h2>
          <p className="text-lg md:text-xl mb-6">Profesyonel destek ile potansiyelinizi keşfedin</p>
          <Link
            to="/booking"
            className="inline-block px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors shadow-lg"
          >
            Hemen Başlayın
          </Link>
        </div>
      </section>
    </>
  );
}
