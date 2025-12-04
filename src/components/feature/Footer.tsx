import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Footer() {
  const [contactInfo, setContactInfo] = useState({
    email: 'info@re-set.com.tr',
    phone: '',
    address: 'Teşvikiye, Hakkı Yeten Cd. No:11 D:7, 34365 Şişli/İstanbul',
    instagram: '',
    youtube: ''
  });

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const { data } = await supabase
          .from('contact_info')
          .select('*')
          .single();
        
        if (data) {
          setContactInfo({
            email: data.email || 'info@re-set.com.tr',
            phone: data.phone || '',
            address: data.address || 'Teşvikiye, Hakkı Yeten Cd. No:11 D:7, 34365 Şişli/İstanbul',
            instagram: data.instagram || '',
            youtube: data.youtube || ''
          });
        }
      } catch (error) {
        console.error('Footer contact info error:', error);
      }
    };
    loadContactInfo();
  }, []);

  const handleCookieSettings = () => {
    localStorage.removeItem('cookieConsent');
    window.location.reload();
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/f8cacb0d1ad0c1f4f6e313d7c034bd99.png" 
              alt="Reset Logo" 
              className="h-12 mb-4"
            />
            <p className="text-gray-400 mb-4">
              Yaşam koçluğu ve danışmanlık hizmetleri ile hayatınızı yeniden keşfedin.
            </p>
            <div className="flex items-center space-x-4">
              {contactInfo.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-[#D4AF37] transition-colors cursor-pointer">
                  <i className="ri-instagram-line text-xl"></i>
                </a>
              )}
              {contactInfo.youtube && (
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

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <i className="ri-mail-line mt-1 mr-2"></i>
                <span>{contactInfo.email}</span>
              </li>
              <li className="flex items-start">
                <i className="ri-phone-line mt-1 mr-2"></i>
                <span>{contactInfo.phone}</span>
              </li>
              <li className="flex items-start">
                <i className="ri-map-pin-line mt-1 mr-2"></i>
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Reset. Tüm hakları saklıdır.
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
            <a href="https://readdy.ai/?origin=logo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
              Powered by Readdy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
