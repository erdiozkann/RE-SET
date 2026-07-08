import Button from '../../components/base/Button';
import { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import SEO from '../../components/SEO';
import { metaFor } from '../../lib/routeMeta';
import { supabase } from '../../lib/supabase';
import { messagesApi } from '../../lib/api';

export default function ContactPage() {
  const toast = useToast();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    workingHours: ''
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (data && !error) {
        setContactInfo({
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          workingHours: data.working_hours || ''
        });
      }
    };

    fetchContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Form alanları firstName + lastName; birleştirip name'e yaz (yoksa mesaj
      // isimsiz kaydediliyordu). Konu kodunu insan-okunur etikete çevir.
      const firstName = (formData.get('firstName') as string || '').trim();
      const lastName = (formData.get('lastName') as string || '').trim();
      const subjectLabels: Record<string, string> = {
        consultation: 'Ücretsiz Danışma',
        'demartini-method': 'Demartini Metodu',
        'value-determination': 'Değer Belirleme',
        'breakthrough-experience': 'Breakthrough Experience',
        other: 'Diğer',
      };
      const subjectCode = formData.get('subject') as string || '';

      // Supabase'e mesajı kaydet
      await messagesApi.create({
        name: `${firstName} ${lastName}`.trim(),
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || '',
        subject: subjectLabels[subjectCode] || 'İletişim Formu',
        message: formData.get('message') as string
      });

      setSubmitStatus('success');
      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      form.reset();
      setTimeout(() => setSubmitStatus('idle'), 2000);
    } catch (error) {
      setSubmitStatus('error');
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message || 'Mesaj gönderilirken bir hata oluştu');
      setTimeout(() => setSubmitStatus('idle'), 2000);
    }
  };

  const contactInfoDisplay = [
    {
      icon: 'ri-mail-line',
      title: 'E-posta',
      content: contactInfo.email,
      action: `mailto:${contactInfo.email}`
    },
    {
      icon: 'ri-phone-line',
      title: 'Telefon',
      content: contactInfo.phone,
      action: `tel:${contactInfo.phone.replace(/\s/g, '')}`
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Adres',
      content: contactInfo.address,
      action: '#'
    },
    {
      icon: 'ri-time-line',
      title: 'Çalışma Saatleri',
      content: contactInfo.workingHours,
      action: '#'
    }
  ];

  const faqs = [
    {
      question: 'İlk görüşme nasıl gerçekleşir?',
      answer: 'İlk görüşmemiz 30 dakika süren ücretsiz bir keşif seansıdır. Bu görüşmede hedeflerinizi, beklentilerinizi dinler ve size nasıl yardımcı olabileceğimi açıklarım.'
    },
    {
      question: 'Seanslar ne kadar sürer?',
      answer: 'Standart seanslarım 60 dakika sürmektedir. İhtiyaçlarınıza göre 45 dakika veya 90 dakikalık seanslar da düzenleyebiliriz.'
    },
    {
      question: 'Hangi konularda destek veriyorsunuz?',
      answer: 'Demartini Metodu, değer belirleme, Breakthrough Experience, yaşam dengeleme ve dönüşüm süreçleri konularında uzmanım.'
    },
    {
      question: 'Online seanslar mevcut mu?',
      answer: 'Evet, online seanslar da sunuyorum. Zoom, Google Meet veya tercih ettiğiniz platform üzerinden görüşebiliriz.'
    }
  ];

  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr').replace(/\/$/, '');

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${siteUrl}/contact#contactpage`,
      name: 'İletişim — RE-SET | Şafak Özkan',
      description: 'Demartini Metodu danışmanlığı için iletişim bilgileri ve ücretsiz keşif görüşmesi.',
      url: `${siteUrl}/contact`,
      inLanguage: 'tr-TR',
      isPartOf: { '@id': 'https://re-set.com.tr/#website' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'İletişim', item: `${siteUrl}/contact` }
        ]
      },
      mainEntity: {
        '@type': 'Organization',
        '@id': 'https://re-set.com.tr/#organization',
        name: 'RE-SET — Şafak Özkan',
        url: siteUrl,
        email: contactInfo.email || undefined,
        telephone: contactInfo.phone || undefined,
        address: contactInfo.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: contactInfo.address,
              addressLocality: 'İstanbul',
              addressRegion: 'İstanbul',
              addressCountry: 'TR'
            }
          : undefined,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: contactInfo.phone || undefined,
            email: contactInfo.email || undefined,
            availableLanguage: ['Turkish', 'English'],
            areaServed: 'TR'
          }
        ]
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Randevu nasıl alabilirim?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Randevu için /booking sayfasından uygun tarih ve saati seçebilir; tercih ederseniz telefon veya e-posta ile de ulaşabilirsiniz. 30 dakikalık ücretsiz keşif görüşmesi de aynı kanaldan planlanır.'
          }
        },
        {
          '@type': 'Question',
          name: 'Online Demartini seansı yapıyor musunuz?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Evet. Zoom veya Google Meet üzerinden yüz yüze seansla eşdeğer kalitede online Demartini Metodu seansları sunuyoruz. Türkiye dışındaki danışanlar da katılabilir.'
          }
        },
        {
          '@type': 'Question',
          name: 'Bir Demartini seansı kaç dakika sürer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Standart birebir seans 60 dakikadır; ihtiyaca göre 45 veya 90 dakikalık seanslar da düzenlenir.'
          }
        }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={metaFor('/contact').title}
        description={metaFor('/contact').description}
        canonical="/contact"
        schema={schema}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-10 md:py-14 bg-gradient-to-br from-[#F5F5F5] to-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#1A1A1A] mb-4 leading-tight">
                İletişim
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Sorularınız için bana ulaşabilir, ücretsiz keşif seansınızı 
                planlayabilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-5">
                  Mesaj Gönderin
                </h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6" id="contact_form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        Adınız *
                      </label>
                      <input
                        id="contact-firstName"
                        type="text"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Soyadınız *
                      </label>
                      <input
                        id="contact-lastName"
                        type="text"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresi *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Konu
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      className="w-full px-4 py-3 pr-8 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    >
                      <option value="">Konu seçin</option>
                      <option value="consultation">Ücretsiz Danışma</option>
                      <option value="demartini-method">Demartini Metodu</option>
                      <option value="value-determination">Değer Belirleme</option>
                      <option value="breakthrough-experience">Breakthrough Experience</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                      placeholder="Lütfen durumunuzu ve nasıl yardımcı olabileceğimi kısaca açıklayın..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Maksimum 500 karakter</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      required
                      className="mt-1"
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      <a href="/privacy" className="text-[#D4AF37] hover:underline">Gizlilik Politikası</a>'nı 
                      okudum ve kişisel verilerimin işlenmesini kabul ediyorum. *
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-full"
                    disabled={submitStatus === 'submitting'}
                  >
                    {submitStatus === 'submitting' ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </Button>
                </form>
              </div>
              
              {/* Contact Info */}
              <div>
                <h2 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-5">
                  İletişim Bilgileri
                </h2>
                
                <div className="space-y-5 mb-8">
                  {contactInfoDisplay.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#D4AF37]/10 rounded-full flex-shrink-0">
                        <i className={`${info.icon} text-2xl text-[#D4AF37]`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
                          {info.title}
                        </h3>
                        {info.action.startsWith('http') || info.action.startsWith('mailto') || info.action.startsWith('tel') ? (
                          <a 
                            href={info.action}
                            className="text-gray-600 hover:text-[#D4AF37] transition-colors"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-gray-600">{info.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 md:py-14 bg-[#F5F5F5]">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-3">
                Sık Sorulan Sorular
              </h2>
              <p className="text-base text-gray-600">
                Merak ettiğiniz konularda hızlı yanıtlar
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] pr-4">
                      {faq.question}
                    </h3>
                    <i className="ri-arrow-down-s-line text-2xl text-gray-400 flex-shrink-0"></i>
                  </button>
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-14 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
              Ücretsiz Keşif Görüşmesi
            </h2>
            <p className="text-base text-white/80 mb-6 leading-relaxed">
              Birlikte çalışıp çalışamayacağımızı keşfetmek için 30 dakikalık 
              ücretsiz bir görüşme yapabiliriz.
            </p>
            <Button variant="primary" size="lg">
              Randevu Talep Et
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
