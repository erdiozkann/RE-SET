import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { contentApi } from '../../lib/api';

// Varsayılan çerez politikası içeriği
const defaultCookiesContent = `
<h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">1. Çerez Nedir?</h2>
<p>Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır. Web sitesini ziyaretiniz sırasında site sunucusu, cihazınızın tarayıcısı ile iletişim halindedir. Çerezler, tarayıcı üzerinden cihazınıza yerleştirilir ve web sitesinin çeşitli özelliklerini hatırlamasına yardımcı olur.</p>

<h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">2. Çerez Türleri</h2>
<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1. Zorunlu Çerezler</h3>
<p>Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan web sitesi düzgün çalışmaz.</p>
<ul class="list-disc pl-6 space-y-1">
  <li>Oturum yönetimi çerezleri</li>
  <li>Güvenlik çerezleri</li>
  <li>Yük dengeleme çerezleri</li>
</ul>

<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2. Performans ve Analitik Çerezler</h3>
<p>Web sitesinin performansını ölçmek ve iyileştirmek için kullanılan çerezlerdir.</p>
<ul class="list-disc pl-6 space-y-1">
  <li><strong>Google Analytics:</strong> Ziyaretçi istatistikleri, sayfa görüntülemeleri ve kullanıcı davranışlarını analiz eder</li>
  <li><strong>Microsoft Clarity:</strong> Kullanıcı deneyimini iyileştirmek için oturum kayıtları ve ısı haritaları oluşturur</li>
</ul>

<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3. İşlevsellik Çerezleri</h3>
<p>Tercihlerinizi hatırlamak ve size daha kişiselleştirilmiş bir deneyim sunmak için kullanılır.</p>
<ul class="list-disc pl-6 space-y-1">
  <li>Dil tercihleri</li>
  <li>Bölge ayarları</li>
  <li>Kullanıcı arayüzü tercihleri</li>
</ul>

<h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
<p>Çerezleri kontrol etmek ve yönetmek için çeşitli seçenekleriniz bulunmaktadır:</p>
<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Tarayıcı Ayarları</h3>
<p>Tarayıcınızın ayarlarından çerezleri kabul etme, reddetme veya silme seçeneklerini kullanabilirsiniz:</p>
<ul class="list-disc pl-6 space-y-1">
  <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</li>
  <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
  <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler ve web sitesi verileri</li>
  <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
</ul>

<h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">4. Çerezlerin Reddi</h2>
<p>Çerezleri reddetmeniz durumunda, web sitesinin bazı özellikleri düzgün çalışmayabilir. Zorunlu çerezler, web sitesinin temel işlevselliği için gerekli olduğundan devre dışı bırakılamaz.</p>

<h2 class="text-2xl font-serif text-[#1A1A1A] mt-8 mb-4">5. İletişim</h2>
<p>Çerez Politikamız hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz:</p>
<p><strong>E-posta:</strong> info@re-set.com.tr</p>
<p><strong>Adres:</strong> Teşvikiye, Hakkı Yeten Cd. No:11 D:7, 34365 Şişli/İstanbul</p>

<p class="mt-8 text-sm text-gray-500"><em>Bu çerez politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Yönetmeliği (GDPR) uyarınca hazırlanmıştır.</em></p>
`;

export default function CookiesPage() {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://re-set.com.tr';
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await contentApi.getCookiesContent();
      if (data && data.content) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Çerez politikası yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Çerez Politikası',
    description: 'Reset web sitesinde kullanılan çerezler, amaçları ve yönetim seçenekleri hakkında detaylı bilgi.',
    url: `${siteUrl}/cerez-politikasi`
  };

  return (
    <>
      <SEO 
        title="Çerez Politikası"
        description="Reset web sitesinde kullanılan çerezler, amaçları ve yönetim seçenekleri hakkında detaylı bilgi."
        canonical="/cerez-politikasi"
        schema={schema}
      />
      
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-6">
              Çerez Politikası
            </h1>
            <p className="text-lg text-gray-600">
              Web sitemizde kullanılan çerezler hakkında bilgilendirme
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content || defaultCookiesContent }}
            />
          )}
        </div>
      </section>
    </>
  );
}
