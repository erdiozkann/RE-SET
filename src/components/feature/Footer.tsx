import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { contentApi } from '../../lib/api';
import type { ContactInfo } from '../../types';

export default function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const data = await contentApi.getContactInfo();
        if (data) {
          setContactInfo(data);
        }
      } catch (error) {
        console.error('Footer contact info error:', error);
      }
    };
    loadContactInfo();
  }, []);

  const handleCookieSettings = () => {
    // Re-open the cookie settings dialog without losing the existing consent
    // record or reloading the page. CookieBanner listens for this event.
    if (typeof window.openCookieSettings === 'function') {
      window.openCookieSettings();
    } else {
      window.dispatchEvent(new Event('cookie-settings-open'));
    }
  };

  return (
    <footer
      className="bg-[#1A1A1A] text-white"
      itemScope
      itemType="https://schema.org/ProfessionalService"
    >
      <meta itemProp="name" content="RE-SET — Şafak Özkan Demartini Metodu" />
      <meta itemProp="url" content="https://re-set.com.tr/" />
      <meta itemProp="priceRange" content="₺₺" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            {contactInfo?.logo_url ? (
              <img
                src={contactInfo.logo_url}
                alt="RE-SET — Şafak Özkan Demartini Metodu logosu"
                className="h-12 w-auto object-contain mb-4 grayscale hover:grayscale-0 transition-all duration-300"
                itemProp="logo"
              />
            ) : (
              <span className="text-2xl font-serif font-bold text-white mb-4 block">RESET</span>
            )}

            <p className="text-gray-400 mb-4" itemProp="description">
              Demartini Metodu ile değerlerinizi keşfedin ve hayatınızı dönüştürün. İstanbul'da profesyonel danışmanlık hizmeti.
            </p>
            <div className="flex items-center space-x-4">
              {contactInfo?.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#D4AF37] transition-colors cursor-pointer">
                  <i className="ri-instagram-line text-xl"></i>
                </a>
              )}
              {contactInfo?.youtube && (
                <a href={contactInfo.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#D4AF37] transition-colors cursor-pointer">
                  <i className="ri-youtube-line text-xl"></i>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Hakkımda
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/podcast" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Podcast
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Randevu Al
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact (NAP — Yerel SEO için microdata) */}
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400">
              {contactInfo?.email && (
                <li className="flex items-start">
                  <i className="ri-mail-line mt-1 mr-2"></i>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-[#D4AF37] transition-colors"
                    itemProp="email"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo?.phone && (
                <li className="flex items-start">
                  <i className="ri-phone-line mt-1 mr-2"></i>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                    className="hover:text-[#D4AF37] transition-colors"
                    itemProp="telephone"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo?.address && (
                <li
                  className="flex items-start"
                  itemProp="address"
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                >
                  <i className="ri-map-pin-line mt-1 mr-2"></i>
                  <span>
                    <span itemProp="streetAddress">{contactInfo.address}</span>
                    <meta itemProp="addressLocality" content="İstanbul" />
                    <meta itemProp="addressRegion" content="Nişantaşı" />
                    <meta itemProp="addressCountry" content="TR" />
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Reset. Tüm hakları saklıdır.
            <span className="mx-2 text-gray-600" aria-hidden="true">|</span>
            <span className="text-gray-500">
              Developed by{' '}
              <a
                href="https://nodeworks.at"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors duration-300"
              >
                NodeWorks.at
              </a>
            </span>
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/kvkk" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
              KVKK
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
              Gizlilik Politikası
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
              Çerez Politikası
            </Link>
            <button onClick={handleCookieSettings} className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
              Çerez Ayarları
            </button>
            <Link to="/copyright" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
              Telif Hakkı
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
}
