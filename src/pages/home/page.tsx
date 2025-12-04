import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Hizmetleri yükle
      const servicesData = await servicesApi.getAll();
      setServices(servicesData);

      // Yöntemleri yükle
      const methodsData = await methodsApi.getAll();
      setMethods(methodsData);

      // Hero içeriği
      const heroData = await contentApi.getHeroContents();
      if (heroData.length > 0) {
        setHeroContent(heroData[0]);
      }

      // About içeriği
      const aboutData = await contentApi.getAboutContents();
      if (aboutData.length > 0) {
        setAboutContent(aboutData[0]);
      }

      // İletişim bilgileri
      const contactData = await contentApi.getContactInfo();
      setContactInfo(contactData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
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
    title: 'Hayatınızı Yeniden Keşfedin',
    description: 'Profesyonel yaşam koçluğu ve danışmanlık hizmetleri ile içsel dengenizi bulun, potansiyelinizi ortaya çıkarın.',
    image: 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg'
  };

  const defaultAbout = {
    title: 'Şafak Özkan',
    paragraph1: '15 yılı aşkın deneyimimle, bireylerin ve çiftlerin yaşamlarında anlamlı değişimler yaratmalarına yardımcı oluyorum.',
    paragraph2: 'Amacım, sizin içsel gücünüzü keşfetmenize ve hayallerinize ulaşmanız için gerekli araçları edinmenize yardımcı olmak.',
    image: 'https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/ca9fa96d33e57c0a0f9cbd2e26da5555.jpeg'
  };

  // Yükleme durumu
  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
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
      name: 'Reset - Şafak Özkan Psikolojik Danışmanlık',
      description: 'İstanbul\'da Demartini Metodu, yaşam koçluğu ve psikolojik danışmanlık hizmetleri sunan profesyonel danışmanlık merkezi.',
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
              name: 'Yaşam Koçluğu',
              description: 'Kişisel hedeflerinize ulaşmanız için profesyonel rehberlik'
            }
          }
        ]
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Şafak Özkan',
      jobTitle: 'Yaşam Koçu ve Demartini Metodu Uygulayıcısı',
      worksFor: {
        '@type': 'Organization',
        name: 'Reset Danışmanlık'
      },
      knowsAbout: ['Demartini Metodu', 'Yaşam Koçluğu', 'NLP', 'Mindfulness', 'Psikolojik Danışmanlık']
    }
  ];

  return (
    <>
      <SEO 
        title="Reset - Şafak Özkan | Demartini Metodu ve Yaşam Koçluğu İstanbul"
        description="İstanbul'da Demartini Metodu uygulayıcısı Şafak Özkan ile profesyonel yaşam koçluğu ve psikolojik danışmanlık. Değerlerinizi keşfedin, potansiyelinizi ortaya çıkarın."
        keywords="demartini metodu, demartini metodu istanbul, yaşam koçu, yaşam koçluğu, psikolojik danışmanlık, kişisel gelişim, şafak özkan"
        schema={schema}
      />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 overflow-hidden">
        {/* Hero Background Image */}
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Hero Background" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            {displayHero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
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
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{displayAbout.title}</h2>
              <p className="text-base md:text-lg text-gray-700 mb-3">{displayAbout.paragraph1}</p>
              <p className="text-base md:text-lg text-gray-700">{displayAbout.paragraph2}</p>
              <Link
                to="/about"
                className="inline-block mt-4 px-6 py-2.5 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-colors"
              >
                Daha Fazla Bilgi
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={aboutImage}
                alt="Şafak Özkan"
                className="w-full h-full object-cover"
              />
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
