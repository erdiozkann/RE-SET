import { useEffect, useState } from 'react';
import Button from '../../components/base/Button';
import type { Certificate } from '../../types';
import SEO from '../../components/SEO';
import { certificatesApi, contentApi } from '../../lib/api';

export default function About() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [heroImage, setHeroImage] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Paralel API çağrıları (daha hızlı yükleme)
        const [certsResult, aboutResult] = await Promise.allSettled([
          certificatesApi.getAll(),
          contentApi.getAboutContents()
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
      } catch (error) {
        console.error('Veri yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const siteUrl = 'https://re-set.com.tr';

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Şafak Özkan",
      "jobTitle": "Sertifikalı Demartini Metodu Uygulayıcısı",
      "description": "İstanbul'da Demartini Metodu uygulayıcısı. 15 yılı aşkın deneyimle binlerce kişinin hayatına dokundum. Değer belirleme, yaşam dengeleme ve Breakthrough Experience alanlarında uzmanım.",
      "url": `${siteUrl}/about`,
      "image": heroImage,
      "alumniOf": certificates.map(cert => ({
        "@type": "EducationalOrganization",
        "name": cert.organization
      })),
      "knowsAbout": ["Demartini Metodu", "Değer Belirleme", "Breakthrough Experience", "Yaşam Dengeleme", "Kişisel Dönüşüm", "Quantum Collapse Process"],
      "hasCredential": certificates.map(cert => ({
        "@type": "EducationalOccupationalCredential",
        "name": cert.title,
        "credentialCategory": "certificate",
        "recognizedBy": {
          "@type": "Organization",
          "name": cert.organization
        }
      }))
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
            "text": "Demartini Metodu, Dr. John Demartini tarafından geliştirilen, bireylerin değerlerini keşfetmelerine, yaşamlarını dengelemelerine ve potansiyellerini ortaya çıkarmalarına yardımcı olan dönüştürücü bir kişisel gelişim yöntemidir."
          }
        },
        {
          "@type": "Question",
          "name": "Şafak Özkan kimdir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Şafak Özkan, İstanbul'da faaliyet gösteren sertifikalı Demartini Metodu uygulayıcısıdır. 15 yılı aşkın deneyimiyle binlerce kişinin Demartini Metodu ile yaşam dönüşümüne rehberlik etmiştir."
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

  return (
    <>
      <SEO
        title="Şafak Özkan | Sertifikalı Demartini Metodu Uygulayıcısı İstanbul"
        description="İstanbul'da sertifikalı Demartini Metodu uygulayıcısı Şafak Özkan. 15 yılı aşkın deneyimle değer belirleme, Breakthrough Experience ve yaşam dengeleme alanlarında uzman."
        keywords="şafak özkan, demartini metodu uygulayıcısı, demartini metodu istanbul, değer belirleme, breakthrough experience, yaşam dengeleme, demartini metodu türkiye"
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
                    Sertifikalı Demartini Metodu Uygulayıcısı
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
                  Sertifikalar & Eğitimler
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
                    title: "Empati Odaklı",
                    description: "Her bireyin kendine özgü hikayesi olduğuna inanır, yargısız bir ortam sunarım."
                  },
                  {
                    icon: "ri-lightbulb-line",
                    title: "Çözüm Odaklı",
                    description: "Geçmişte takılıp kalmak yerine, geleceğe yönelik çözümler üretiriz."
                  },
                  {
                    icon: "ri-compass-3-line",
                    title: "Kişiye Özel",
                    description: "Standart reçeteler yerine, size özel stratejiler geliştiririz."
                  },
                  {
                    icon: "ri-seedling-line",
                    title: "Büyüme Odaklı",
                    description: "Sürekli gelişim ve öğrenme sürecini desteklerim."
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
                Birlikte Yolculuğa Çıkmaya Hazır mısınız?
              </h2>
              <p className="text-base text-white/80 mb-6 leading-relaxed">
                Değişim için ilk adımı atmaya hazır olduğunuzda, ben burada olacağım.
                Ücretsiz keşif seansınızı rezerve edin.
              </p>
              <Button variant="primary" size="lg">
                Ücretsiz Görüşme
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
