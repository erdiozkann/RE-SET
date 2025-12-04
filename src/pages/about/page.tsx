import { useEffect, useState } from 'react';
import Button from '../../components/base/Button';
import type { Certificate } from '../../types';
import SEO from '../../components/SEO';
import { supabase } from '../../lib/supabase';

export default function About() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [heroImage, setHeroImage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch certificates
      const { data: certsData } = await supabase
        .from('certificates')
        .select('*')
        .order('year', { ascending: false });
      
      if (certsData) {
        setCertificates(certsData);
      }

      // Fetch hero image
      const { data: imagesData } = await supabase
        .from('profile_images')
        .select('*')
        .eq('location', 'about-hero')
        .single();
      
      if (imagesData) {
        setHeroImage(imagesData.url);
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
      "jobTitle": "Yaşam Koçu, Demartini Metodu Uygulayıcısı ve Kişisel Gelişim Uzmanı",
      "description": "İstanbul'da Demartini Metodu uygulayıcısı ve yaşam koçu. 15 yılı aşkın deneyimle binlerce kişinin hayatına dokundum. Değer belirleme, yaşam koçluğu ve mindfulness alanlarında uzmanım.",
      "url": `${siteUrl}/about`,
      "image": heroImage,
      "alumniOf": certificates.map(cert => ({
        "@type": "EducationalOrganization",
        "name": cert.organization
      })),
      "knowsAbout": ["Demartini Metodu", "Yaşam Koçluğu", "Kişisel Gelişim", "Mindfulness", "NLP", "İlişki Danışmanlığı", "Kariyer Koçluğu", "Değer Belirleme"],
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
            "text": "Şafak Özkan, İstanbul'da faaliyet gösteren sertifikalı bir Demartini Metodu uygulayıcısı, yaşam koçu ve kişisel gelişim uzmanıdır. 15 yılı aşkın deneyimiyle binlerce kişinin hayatına dokunmuştur."
          }
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Şafak Özkan | Demartini Metodu Uygulayıcısı ve Yaşam Koçu İstanbul"
        description="İstanbul'da Demartini Metodu uygulayıcısı Şafak Özkan hakkında. 15 yılı aşkın deneyimle yaşam koçluğu, kişisel gelişim ve değer belirleme alanlarında uzman. Uluslararası sertifikalı yaşam koçu."
        keywords="şafak özkan, demartini metodu uygulayıcısı, demartini metodu istanbul, yaşam koçu istanbul, kişisel gelişim uzmanı, mindfulness, nlp, değer belirleme"
        schema={schema}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-[#F5F5F5] to-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] mb-6 leading-tight">
                  Şafak Özkan
                </h1>
                <p className="text-xl md:text-2xl text-[#D4AF37] mb-6 font-medium">
                  Yaşam Koçu & Kişisel Gelişim Uzmanı
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  15 yılı aşkın deneyimle binlerce kişinin hayatına dokundum. 
                  Yaşam koçluğu, kişisel gelişim ve mindfulness alanlarındaki uzmanlığımla 
                  size de kendi potansiyelinizi keşfetmenizde yardımcı oluyorum.
                </p>
                <Button variant="primary" size="lg">
                  Randevu Al
                </Button>
              </div>
              <div className="relative flex justify-center">
                <div className="aspect-square w-full max-w-lg rounded-2xl overflow-hidden">
                  <img 
                    src={heroImage || 'https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20a%20confident%20life%20coach%20woman%20in%20her%2040s%2C%20warm%20smile%2C%20professional%20attire%2C%20natural%20lighting%2C%20minimal%20background%2C%20inspiring%20and%20trustworthy%20appearance%2C%20high%20quality%20professional%20photography&width=600&height=600&seq=safak1&orientation=squarish'}
                    alt="Şafak Özkan"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hikayem */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-8 text-center">
              Hikayem
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6 leading-relaxed">
                Hayatımın büyük bir bölümünde, başkalarının beklentilerini karşılamaya odaklanmış, 
                kendi iç sesimi duymakta zorlandığım bir dönem yaşadım. Kurumsal dünyada geçirdiğim 
                yıllar boyunca başarılı görünürken, içimde derin bir boşluk hissediyordum.
              </p>
              <p className="mb-6 leading-relaxed">
                Bu iç yolculuk, beni yaşam koçluğu ve kişisel gelişim dünyasıyla tanıştırdı. 
                Önce kendi hayatımı dönüştürdüm, sonra bu dönüşümün gücünü başkalarıyla paylaşma 
                arzusu doğdu. Uluslararası sertifikalarımı aldım, sürekli eğitimlerle kendimi 
                geliştirdim ve bugün buradayım.
              </p>
              <p className="mb-0 leading-relaxed">
                Artık biliyorum ki, gerçek değişim içeriden başlar. Her bireyin kendine özgü bir 
                potansiyeli vardır ve bu potansiyeli ortaya çıkarmak için sadece doğru rehberliğe 
                ve içsel farkındalığa ihtiyaç vardır.
              </p>
            </div>
          </div>
        </section>

        {/* Sertifikalar & Eğitimler */}
        <section className="py-16 md:py-24 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-12 text-center">
              Sertifikalar & Eğitimler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* Yaklaşımım */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-12 text-center">
              Yaklaşımım
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
              Birlikte Yolculuğa Çıkmaya Hazır mısınız?
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Değişim için ilk adımı atmaya hazır olduğunuzda, ben burada olacağım. 
              Ücretsiz keşif seansınızı rezerve edin.
            </p>
            <Button variant="primary" size="lg">
              Ücretsiz Görüşme
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
