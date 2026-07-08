import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/base/Button';
import type { Certificate } from '../../types';
import SEO from '../../components/SEO';
import { metaFor } from '../../lib/routeMeta';
import { useToast } from '../../components/ToastContainer';
import { certificatesApi, contentApi } from '../../lib/api';
export default function About() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [heroImage, setHeroImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [certsResult, aboutResult] = await Promise.allSettled([
        certificatesApi.getAll(),
        contentApi.getAboutContents(),
      ]);

      if (certsResult.status === 'fulfilled' && certsResult.value) {
        setCertificates(certsResult.value);
      }

      if (aboutResult.status === 'fulfilled' && aboutResult.value?.length > 0) {
        setAboutContent(aboutResult.value[0]);
        if (aboutResult.value[0].image) {
          setHeroImage(aboutResult.value[0].image);
        }
      }

      // Both critical calls failed → surface a retryable error to the user.
      if (certsResult.status === 'rejected' && aboutResult.status === 'rejected') {
        setLoadError(true);
        toast.error('Sayfa içeriği yüklenemedi. Tekrar denemek için aşağıdaki butonu kullanın.');
        console.error('About load failures:', certsResult.reason, aboutResult.reason);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const siteUrl = 'https://re-set.com.tr';

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${siteUrl}/about#profile`,
      "mainEntity": { "@id": "https://re-set.com.tr/#safakozkan" },
      "url": `${siteUrl}/about`,
      "inLanguage": "tr-TR",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": `${siteUrl}/` },
          { "@type": "ListItem", "position": 2, "name": "Hakkımda", "item": `${siteUrl}/about` }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://re-set.com.tr/#safakozkan",
      "name": "Şafak Özkan",
      "jobTitle": "Eğitimli Demartini Yöntemi Uygulayıcısı",
      "description": "İstanbul Tarabya merkezli, Eğitimli Demartini Yöntemi Uygulayıcısı (Trained Demartini Method Facilitator) ve Primordial Ses (Sound) Meditasyonu eğitmeni. 11 yıllık uygulama deneyimi. Değer belirleme, ilişki dengeleme, Breakthrough Experience, Primordial Ses Meditasyonu ve kişisel dönüşüm alanlarında çalışır.",
      "url": `${siteUrl}/about`,
      "image": heroImage || 'https://re-set.com.tr/og-image.jpg',
      "worksFor": { "@id": "https://re-set.com.tr/#organization" },
      "hasOccupation": {
        "@type": "Occupation",
        "name": "Demartini Method Facilitator",
        "skills": "Demartini Metodu, Değer Belirleme, Quantum Collapse Process, İlişki Dengeleme",
        "occupationLocation": { "@type": "City", "name": "İstanbul" }
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "The Demartini Institute",
          "sameAs": "https://drdemartini.com/"
        },
        ...certificates.map(cert => ({
          "@type": "EducationalOrganization",
          "name": cert.organization
        }))
      ],
      "knowsAbout": ["Demartini Metodu", "Değer Belirleme Süreci", "Breakthrough Experience", "Yaşam Dengeleme", "Kişisel Dönüşüm", "Quantum Collapse Process", "İlişki Dengeleme", "Primordial Ses Meditasyonu", "Mantra Meditasyonu"],
      "hasCredential": certificates.map(cert => ({
        "@type": "EducationalOccupationalCredential",
        "name": cert.title,
        "credentialCategory": "certificate",
        "dateCreated": cert.year ? String(cert.year) : undefined,
        "recognizedBy": {
          "@type": "Organization",
          "name": cert.organization
        }
      })),
      "sameAs": [
        "https://drdemartini.com/tr/demartini-method",
        "https://www.youtube.com/@SafakOzkan-y6i",
        "https://www.instagram.com/safakozkandemartini/"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Demartini Metodu nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Demartini Metodu, Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process'ten oluşan sistematik bir algı dengeleme ve kişisel dönüşüm yöntemidir."
          }
        },
        {
          "@type": "Question",
          "name": "Şafak Özkan kimdir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Şafak Özkan, İstanbul Tarabya merkezli Eğitimli Demartini Yöntemi Uygulayıcısı (Trained Demartini Method Facilitator) ve Primordial Ses Meditasyonu eğitmenidir. 11 yıllık uygulama deneyimiyle Türkiye'de danışanlarına Demartini Metodu ile rehberlik etmektedir."
          }
        },
        {
          "@type": "Question",
          "name": "Şafak Özkan'ın Demartini eğitimi ve yetkinliği nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": certificates.length > 0
              ? `Sayfada listelenen tüm sertifikalar: ${certificates.map(c => c.title).join(', ')}.`
              : "Şafak Özkan, Dr. John Demartini'nin resmi uygulayıcı dizininde 'Trained' seviyesinde listelenen bir Demartini Yöntemi uygulayıcısıdır; aldığı Demartini eğitimleri Hakkımda sayfasında yer alır."
          }
        }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-teal-600 animate-spin mb-4"></i>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-16 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 h-screen px-4">
        <div className="text-center max-w-md">
          <i className="ri-wifi-off-line text-5xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-serif text-gray-900 mb-2">Sayfa yüklenemedi</h2>
          <p className="text-gray-600 mb-6 text-sm">
            İnternet bağlantınızı kontrol edip tekrar deneyebilirsiniz.
          </p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={metaFor('/about').title}
        description={metaFor('/about').description}
        canonical="/about"
        schema={schema}
      />

      {aboutContent && (
        <div className="bg-white">
          {/* Hero Section */}
          <section className="relative py-12 md:py-20 bg-gradient-to-br from-[#F5F5F5] to-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <h1
                    className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 leading-tight"
                    style={{ color: aboutContent.text_color || '#1A1A1A' }}
                  >
                    {aboutContent.title}
                  </h1>
                  <p className="text-lg md:text-xl text-[#D4AF37] mb-4 font-medium">
                    Eğitimli Demartini Yöntemi Uygulayıcısı
                  </p>
                  <p className="text-base text-gray-600 leading-relaxed mb-6">
                    {aboutContent.paragraph1}
                  </p>
                  <Button variant="primary" size="lg">
                    Randevu Al
                  </Button>
                </div>
                <div className="relative flex justify-center">
                  <div className="aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-lg">
                    {heroImage ? (
                      <img
                        src={heroImage}
                        alt="Şafak Özkan"
                        className="w-full h-full object-cover object-center"
                        fetchPriority="high"
                      />
                    ) : (
                      <i className="ri-user-smile-line text-6xl text-gray-300"></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hikayem */}
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-6 text-center">
                Hikayem
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                {aboutContent.story && aboutContent.story.split('\n').map((paragraph: string, index: number) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                ))}

                {aboutContent.paragraph2 && (
                  <p className="mb-0 leading-relaxed mt-4">
                    {aboutContent.paragraph2}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Sertifikalar & Eğitimler */}
          {certificates.length > 0 && (
            <section className="py-12 md:py-16 bg-[#F5F5F5]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-8 text-center">
                  Sertifikalar ve Eğitimler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                        {cert.title}
                      </h3>
                      <p className="text-[#D4AF37] font-medium mb-1">
                        {cert.organization}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cert.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Yaklaşımım */}
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-8 text-center">
                Yaklaşımım
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: "ri-heart-line",
                    title: "Empati ve Anlayış",
                    description: "Her danışanın benzersiz olduğuna inanıyorum."
                  },
                  {
                    icon: "ri-lightbulb-line",
                    title: "Çözüm Odaklı",
                    description: "Geçmişte değil, geleceğe odaklanıyoruz."
                  },
                  {
                    icon: "ri-compass-3-line",
                    title: "Kişiselleştirilmiş Yaklaşım",
                    description: "Size özel çözümler üretiyoruz."
                  },
                  {
                    icon: "ri-seedling-line",
                    title: "Sürekli Gelişim",
                    description: "Kendimi ve metodumu sürekli geliştiriyorum."
                  }
                ].map((approach, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-[#D4AF37]/10 rounded-full mx-auto mb-4">
                      <i className={`${approach.icon} text-3xl text-[#D4AF37]`}></i>
                    </div>
                    <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
                      {approach.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {approach.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 md:py-16 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
            <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
                Hayatınızı Dönüştürmeye Hazır mısınız?
              </h2>
              <p className="text-base text-white/80 mb-6 leading-relaxed">
                İlk danışmanlık seansınızı hemen planlayın.
              </p>
              <Button variant="primary" size="lg">
                Randevu Al
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
