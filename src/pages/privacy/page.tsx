import SEO from '../../components/SEO';

const PrivacyPage = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gizlilik Politikası',
    description: 'Reset - Şafak Özkan Danışmanlık gizlilik politikası ve kullanıcı verilerinin korunması',
    url: `${siteUrl}/privacy`
  };

  return (
    <>
      <SEO
        title="Gizlilik Politikası"
        description="Reset - Şafak Özkan Danışmanlık gizlilik politikası ve kullanıcı verilerinin korunması"
        canonical="/privacy"
        schema={schema}
      />
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-6">
              Gizlilik Politikası
            </h1>
            <p className="text-lg text-gray-600">
              Kişisel bilgilerinizin korunması bizim için önceliktir
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">1. Giriş</h2>
            <p>
              Reset - Şafak Özkan olarak, kişisel bilgilerinizin gizliliği ve güvenliği 
              konusunda sorumluluğumuzun bilincindeyiz. Bu gizlilik politikası, 
              kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
            </p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">2. Topladığımız Bilgiler</h2>
            <p>Aşağıdaki bilgileri toplayabiliriz:</p>
            <ul>
              <li><strong>Kişisel Bilgiler:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
              <li><strong>Randevu Bilgileri:</strong> Randevu tarihleri, saatleri ve notları</li>
              <li><strong>İletişim Geçmişi:</strong> E-posta yazışmaları ve telefon görüşme kayıtları</li>
              <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri</li>
              <li><strong>Danışmanlık Bilgileri:</strong> Seanslar sırasında paylaştığınız bilgiler</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">3. Bilgilerin Kullanım Amacı</h2>
            <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul>
              <li>Danışmanlık hizmetlerinin etkili bir şekilde sunulması</li>
              <li>Randevu planlaması ve hatırlatmaları</li>
              <li>Size özel öneriler ve içerik sunma</li>
              <li>Hizmet kalitemizi artırma</li>
              <li>Yasal yükümlülüklerimizi yerine getirme</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">4. Bilgi Paylaşımı</h2>
            <p>
              Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız. İstisnai durumlar:
            </p>
            <ul>
              <li>Yasal zorunluluklar (mahkeme kararı, yasal süreç)</li>
              <li>Acil durumlarda güvenliğin sağlanması</li>
              <li>Açık rızanızın bulunması</li>
              <li>Anonim veri analizi (kişisel kimlik bilgileri çıkarılarak)</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">5. Danışman-Danışan Gizliliği</h2>
            <p>
              Yaşam koçluğu ve danışmanlık etiği gereği, seanslarımızda paylaştığınız 
              tüm bilgiler kesinlikle gizli tutulur. Bu bilgiler:
            </p>
            <ul>
              <li>Sadece danışmanlık sürecinin iyileştirilmesi için kullanılır</li>
              <li>Hiçbir şekilde üçüncü kişilerle paylaşılmaz</li>
              <li>Güvenli ortamlarda saklanır</li>
              <li>Danışmanlık ilişkisi sona erdikten sonra da korunur</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">6. Veri Güvenliği</h2>
            <p>Bilgilerinizi korumak için aldığımız önlemler:</p>
            <ul>
              <li>Şifreli (SSL) bağlantılar kullanımı</li>
              <li>Güvenli sunucular ve veri merkezleri</li>
              <li>Düzenli güvenlik güncellemeleri</li>
              <li>Sınırlı erişim kontrolü</li>
              <li>Düzenli veri yedekleme</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">7. Çerezler (Cookies)</h2>
            <p>
              Web sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz. 
              Çerezler sayesinde:
            </p>
            <ul>
              <li>Site tercihleriniz hatırlanır</li>
              <li>Daha kişiselleştirilmiş içerik sunulur</li>
              <li>Site performansı analiz edilir</li>
            </ul>
            <p>Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.</p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">8. Haklarınız</h2>
            <p>Kişisel bilgilerinizle ilgili haklarınız:</p>
            <ul>
              <li>Hangi bilgilerin toplandığını öğrenme</li>
              <li>Bilgilerinizin düzeltilmesini talep etme</li>
              <li>Bilgilerinizin silinmesini isteme</li>
              <li>Veri işlemeye itiraz etme</li>
              <li>Bilgilerinizi başka platforma taşıma</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">9. Saklama Süresi</h2>
            <p>
              Kişisel bilgilerinizi yalnızca gerekli olduğu süre boyunca saklarız:
            </p>
            <ul>
              <li>Aktif danışmanlık süresi + 3 yıl</li>
              <li>Yasal zorunluluklar gereği daha uzun süre</li>
              <li>Açık rızanızın geri alınması durumunda derhal silinir</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">10. Değişiklikler</h2>
            <p>
              Bu gizlilik politikasını gerektiğinde güncelleyebiliriz. 
              Önemli değişiklikler e-posta yoluyla bildirilir.
            </p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">11. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız için:
            </p>
            <p>
              <strong>E-posta:</strong> info@re-set.com.tr<br />
              <strong>Adres:</strong> Teşvikiye, Hakkı Yeten Cd. No:11 D:7, 34365 Şişli/İstanbul
            </p>

            <p className="text-sm text-gray-500 mt-8">
              <strong>Son Güncelleme:</strong> 03 Aralık 2024
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPage;
