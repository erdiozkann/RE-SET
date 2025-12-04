import { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import { contentApi } from '../../lib/api';

const KVKKPage = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await contentApi.getKvkkContent();
        if (data) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('KVKK içeriği yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'KVKK Aydınlatma Metni',
    description: 'Reset - Şafak Özkan Danışmanlık KVKK aydınlatma metni ve kişisel verilerin korunması politikası',
    url: `${siteUrl}/kvkk`
  };

  // Varsayılan içerik (veritabanında içerik yoksa)
  const defaultContent = `
    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">1. Veri Sorumlusu</h2>
    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Reset - Şafak Özkan tarafından işlenmektedir.</p>
    
    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">2. İşlenen Kişisel Veriler</h2>
    <p>Aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>Kimlik bilgileri (ad, soyad)</li>
      <li>İletişim bilgileri (e-posta, telefon)</li>
      <li>Randevu ve seans bilgileri</li>
      <li>Danışmanlık sürecine ilişkin notlar</li>
      <li>Ödeme bilgileri</li>
    </ul>
    
    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">3. İşleme Amaçları</h2>
    <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>Danışmanlık hizmetlerinin sunulması</li>
      <li>Randevu planlaması ve takibi</li>
      <li>İletişim kurulması</li>
      <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
      <li>Hizmet kalitesinin artırılması</li>
    </ul>
    
    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">4. Haklarınız</h2>
    <p>KVKK'nin 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
      <li>İşlenen verileriniz hakkında bilgi talep etme</li>
      <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
      <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
      <li>Kişisel verilerin işlenmesine itiraz etme</li>
    </ul>
    
    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">5. İletişim</h2>
    <p>KVKK kapsamındaki taleplerinizi aşağıdaki iletişim bilgileri üzerinden bize iletebilirsiniz.</p>
    <p><strong>E-posta:</strong> info@re-set.com.tr</p>
  `;

  return (
    <>
      <SEO
        title="KVKK Aydınlatma Metni"
        description="Reset - Şafak Özkan Danışmanlık KVKK aydınlatma metni ve kişisel verilerin korunması politikası"
        canonical="/kvkk"
        schema={schema}
      />
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-6">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-lg text-gray-600">
              Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content || defaultContent }}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default KVKKPage;
