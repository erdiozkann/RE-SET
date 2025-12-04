import SEO from '../../components/SEO';

const CopyrightPage = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Telif Hakları',
    description: 'Reset - Şafak Özkan Danışmanlık telif hakları ve içerik kullanım koşulları',
    url: `${siteUrl}/copyright`
  };

  return (
    <>
      <SEO
        title="Telif Hakları"
        description="Reset - Şafak Özkan Danışmanlık telif hakları ve içerik kullanım koşulları"
        canonical="/copyright"
        schema={schema}
      />
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-6">
              Telif Hakları
            </h1>
            <p className="text-lg text-gray-600">
              Fikri mülkiyet hakları ve kullanım koşulları
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">1. Telif Hakları Bildirimi</h2>
            <p>
              Bu web sitesindeki tüm içerik, tasarım, metin, görsel, ses, video, logo, 
              marka ve diğer materyaller Reset - Şafak Özkan'a aittir ve telif hakkı 
              yasalarıyla korunmaktadır.
            </p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">2. Korunan İçerikler</h2>
            <p>Aşağıdaki içerikler telif hakkı koruması altındadır:</p>
            <ul>
              <li>Tüm blog yazıları ve makaleler</li>
              <li>Podcast bölümleri ve ses kayıtları</li>
              <li>Video içerikler ve sunumlar</li>
              <li>Fotoğraf ve görseller</li>
              <li>Reset logosu ve marka kimliği</li>
              <li>Web sitesi tasarımı ve düzeni</li>
              <li>Eğitim materyalleri ve çalışma kağıtları</li>
              <li>Kişisel gelişim araçları ve testler</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">3. İzinli Kullanım</h2>
            <p>Aşağıdaki durumlarda içeriklerimizi kullanabilirsiniz:</p>
            <ul>
              <li><strong>Kişisel Kullanım:</strong> Blog yazılarını kişisel gelişiminiz için okuyabilir, notlar alabilirsiniz</li>
              <li><strong>Eğitim Amaçlı:</strong> Akademik çalışmalar için kaynak göstererek alıntı yapabilirsiniz</li>
              <li><strong>Sosyal Medya:</strong> Kaynak belirterek kısa alıntılar paylaşabilirsiniz</li>
              <li><strong>İnceleme:</strong> Blog yazılarımız hakkında eleştiri veya inceleme yazabilirsiniz</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">4. Yasaklanan Kullanımlar</h2>
            <p>Aşağıdaki kullanımlar kesinlikle yasaktır:</p>
            <ul>
              <li>İçerikleri izinsiz kopyalama veya çoğaltma</li>
              <li>Ticari amaçlarla kullanım (yazılı izin olmadan)</li>
              <li>İçerikleri değiştirerek farklı platformlarda yayınlama</li>
              <li>Reset logosu veya marka kimliğini izinsiz kullanma</li>
              <li>Podcast bölümlerini izinsiz yeniden yayınlama</li>
              <li>Eğitim materyallerini satış amaçlı kullanma</li>
              <li>Web sitesi tasarımını kopyalama</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">5. Alıntı ve Kaynak Gösterme</h2>
            <p>İçeriklerimizden alıntı yaparken aşağıdaki kurallara uyunuz:</p>
            <ul>
              <li>Yazar adını açıkça belirtin: "Şafak Özkan"</li>
              <li>Web sitesi adresini kaynak olarak gösterin</li>
              <li>Orijinal makale başlığını ve tarihini belirtin</li>
              <li>Alıntı miktarını makul sınırlarda tutun (%10'dan fazla olmayacak şekilde)</li>
              <li>Mümkünse orijinal içeriğe doğrudan link verin</li>
            </ul>

            <h3 className="text-xl font-serif text-[#1A1A1A] mt-6 mb-3">Örnek Kaynak Gösterimi:</h3>
            <div className="bg-[#F5F5F5] p-4 rounded-lg">
              <p className="text-sm font-mono">
                Şafak Özkan, "Farkındalık Pratiği ile Hayatınızı Dönüştürün", 
                Reset Blog, 15 Ocak 2024. 
                https://re-set.com.tr/blog/farkindalik-pratigi
              </p>
            </div>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">6. Üçüncü Taraf İçerikleri</h2>
            <p>
              Web sitemizde kullanılan bazı görseller, ikonlar veya diğer materyaller 
              üçüncü taraflardan lisanslanmıştır. Bu içeriklerin kendi telif hakları 
              ve kullanım koşulları geçerlidir.
            </p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">7. DMCA Bildirimi</h2>
            <p>
              Telif hakkı ihlali tespit ettiğinizde, aşağıdaki bilgileri içeren 
              bir DMCA bildirimi gönderebilirsiniz:
            </p>
            <ul>
              <li>Telif hakkı sahibinin kimlik bilgileri</li>
              <li>İhlal edilen eserin açıklaması</li>
              <li>İhlal eden içeriğin konumu</li>
              <li>İletişim bilgileriniz</li>
              <li>İyi niyetle hareket ettiğinize dair beyan</li>
              <li>Bilgilerin doğru olduğuna dair yemin</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">8. Ticari Kullanım İzni</h2>
            <p>
              İçeriklerimizi ticari amaçlarla kullanmak istiyorsanız, 
              önceden yazılı izin almanız gerekmektedir. İzin başvurusu için:
            </p>
            <ul>
              <li>Kullanım amacını detaylı açıklayın</li>
              <li>Hangi içerikleri kullanacağınızı belirtin</li>
              <li>Kullanım süresini ve kapsamını açıklayın</li>
              <li>Ticari faaliyetiniz hakkında bilgi verin</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">9. İhlal Durumunda Yapılacaklar</h2>
            <p>
              Telif hakkı ihlali durumunda aşağıdaki yasal yollara başvurulabilir:
            </p>
            <ul>
              <li>İhlali durdurma talebi (Cease and Desist)</li>
              <li>Maddi ve manevi tazminat davası</li>
              <li>İçeriğin kaldırılması talebi</li>
              <li>Hukuki takibat başlatılması</li>
            </ul>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">10. Creative Commons İçerikler</h2>
            <p>
              Bazı blog yazılarımız Creative Commons Attribution-NonCommercial 4.0 
              lisansı altında paylaşılabilir. Bu içerikler için ayrı kullanım 
              koşulları geçerlidir.
            </p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">11. İletişim</h2>
            <p>
              Telif hakları konusundaki sorularınız ve izin talepleri için:
            </p>
            <p>
              <strong>E-posta:</strong> info@re-set.com.tr<br />
              <strong>Adres:</strong> Teşvikiye, Hakkı Yeten Cd. No:11 D:7, 34365 Şişli/İstanbul
            </p>

            <h2 className="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">12. Güncelleme</h2>
            <p>
              Bu telif hakları bildirimi gerektiğinde güncellenebilir. 
              Değişiklikler web sitesinde duyurulur.
            </p>

            <p className="text-sm text-gray-500 mt-8 text-center">
              <strong>© 2024 Reset - Şafak Özkan. Tüm hakları saklıdır.</strong><br />
              Son Güncelleme: 03 Aralık 2024
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default CopyrightPage;
