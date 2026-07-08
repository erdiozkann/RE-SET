import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import SEO from '../../components/SEO';
import { contentApi } from '../../lib/api';
import { metaFor } from '../../lib/routeMeta';

const KVKKPage = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';
  const meta = metaFor('/kvkk');
  const [content, setContent] = useState<string | null>(null);


  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await contentApi.getKvkkContent();
        if (data) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('KVKK içeriği yüklenemedi:', error);
        // Loading removed
      }
    };
    loadContent();
  }, []);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: `${siteUrl}/kvkk`
  };

  // Varsayılan içerik (veritabanında içerik yoksa). NOT: Bu metin standart bir
  // KVKK aydınlatma şablonudur; yayımlanmadan önce bir hukuk danışmanınca gözden
  // geçirilmelidir (özellikle özel nitelikli veri, açık rıza ve yurt dışı aktarım).
  const defaultContent = `
    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">1. Veri Sorumlusu</h2>
    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>RE-SET — Şafak Özkan</strong> tarafından işlenmektedir.</p>
    <p><strong>Adres:</strong> Tarabya, İstanbul &nbsp;|&nbsp; <strong>E-posta:</strong> info@re-set.com.tr</p>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">2. İşlenen Kişisel Veriler</h2>
    <p>Aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>Kimlik bilgileri (ad, soyad)</li>
      <li>İletişim bilgileri (e-posta, telefon)</li>
      <li>Randevu ve seans bilgileri</li>
      <li>Danışmanlık sürecine ilişkin notlar</li>
      <li>Ödeme bilgileri</li>
    </ul>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">3. Özel Nitelikli Kişisel Veriler</h2>
    <p>Danışmanlık sürecinin doğası gereği, seanslar sırasında paylaştığınız bazı bilgiler (ruhsal/duygusal durumunuza ilişkin ifadeler gibi) KVKK m.6 kapsamında <strong>özel nitelikli kişisel veri</strong> sayılabilir. Bu tür veriler yalnızca <strong>açık rızanıza</strong> dayanılarak ve hizmetin gerektirdiği ölçüde işlenir; talebiniz hâlinde silinir.</p>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">4. İşleme Amaçları ve Hukuki Sebep</h2>
    <p>Kişisel verileriniz; danışmanlık hizmetlerinin sunulması, randevu planlaması ve takibi, iletişim kurulması, hukuki yükümlülüklerin yerine getirilmesi ve hizmet kalitesinin artırılması amaçlarıyla; bir sözleşmenin kurulması/ifası, hukuki yükümlülük ve — özel nitelikli veriler bakımından — <strong>açık rıza</strong> hukuki sebeplerine dayanılarak işlenir.</p>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">5. Yurt Dışına Aktarım</h2>
    <p>Web sitesi ve randevu altyapısı, sunucuları yurt dışında bulunabilen hizmet sağlayıcılar (ör. barındırma ve veritabanı hizmetleri) aracılığıyla çalışır. Bu nedenle kişisel verileriniz, KVKK m.9'da öngörülen şartlar ve açık rızanız çerçevesinde yurt dışındaki sunuculara aktarılabilir/işlenebilir.</p>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">6. Saklama Süresi</h2>
    <p>Kişisel verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır; sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.</p>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">7. Haklarınız</h2>
    <p>KVKK'nin 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
      <li>İşlenen verileriniz hakkında bilgi talep etme</li>
      <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
      <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
      <li>Açık rızanızı her zaman geri alma</li>
      <li>Kişisel verilerin işlenmesine itiraz etme</li>
    </ul>

    <h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">8. İletişim</h2>
    <p>KVKK kapsamındaki taleplerinizi aşağıdaki iletişim bilgileri üzerinden bize iletebilirsiniz.</p>
    <p><strong>E-posta:</strong> info@re-set.com.tr &nbsp;|&nbsp; <strong>Adres:</strong> Tarabya, İstanbul</p>
  `;

  return (
    <>
      <SEO
        title={meta.title}
        description={meta.description}
        canonical="/kvkk"
        schema={schema}
      />
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-4">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-base text-gray-600">
              Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme
            </p>
          </div>

          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || defaultContent) }}
          />
        </div>
      </section>
    </>
  );
};

export default KVKKPage;
