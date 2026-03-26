import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import { methodsApi } from '../../lib/api';
import type { Method } from '../../types';

export default function MethodsPage() {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<Method[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const data = await methodsApi.getAll();
        setMethods(data || []);
      } catch (error) {
        console.error('Yöntemler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMethods();
  }, []);

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
      name: t('methods_page.seo.title'),
      description: t('methods_page.seo.description'),
      url: `${siteUrl}/methods`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Demartini Metodu',
            description: 'Dr. John Demartini tarafından geliştirilen, değerlerinizi keşfetmenize ve yaşamınızı dengelemenize yardımcı olan dönüştürücü bir yöntem.'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'NLP (Nöro Linguistik Programlama)',
            description: 'Düşünce kalıplarınızı yeniden programlayarak davranış değişikliği sağlayan etkili bir yöntem.'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Mindfulness',
            description: 'Farkındalık temelli stres azaltma ve zihinsel berraklık teknikleri.'
          }
        ]
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: t('methods_page.seo.title'),
      description: t('methods_page.seo.description'),
      provider: {
        '@type': 'Person',
        name: 'Şafak Özkan',
        jobTitle: 'Sertifikalı Demartini Metodu Uygulayıcısı'
      },
      areaServed: {
        '@type': 'City',
        name: 'İstanbul'
      },
      serviceType: 'Demartini Metodu Danışmanlığı'
    }
  ];

  return (
    <>
      <SEO
        title={t('methods_page.seo.title')}
        description={t('methods_page.seo.description')}
        keywords={t('methods_page.seo.keywords')}
        schema={schema}
      />

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              {t('methods_page.title') || 'Kullandığım Yöntemler'}
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              {t('methods_page.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <MethodSkeleton />
                <MethodSkeleton />
                <MethodSkeleton />
              </>
            ) : methods.length > 0 ? (
              methods.map((method) => (
                <div key={method.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                    <i className={`${method.icon || 'ri-lightbulb-line'} text-3xl text-teal-600`}></i>
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
                <p className="text-gray-500">{t('methods_page.empty_state') || 'Henüz yöntem eklenmemiş.'}</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg max-w-3xl mx-auto">
              <h2 className="text-xl md:text-2xl font-serif text-gray-900 mb-3">
                {t('about.approach_title') || 'Size Özel Bir Yaklaşım'}
              </h2>
              <p className="text-gray-600 mb-5 text-sm md:text-base">
                {t('about.approaches.custom_desc')}
              </p>
              <a
                href="/booking"
                className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg text-sm md:text-base"
              >
                {t('about.appointment_button') || 'Randevu Alın'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
