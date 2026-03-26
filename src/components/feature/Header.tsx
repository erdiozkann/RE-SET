import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { contentApi } from '../../lib/api';
import type { ContactInfo } from '../../types';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const location = useLocation();
  const { t, i18n } = useTranslation();



  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await contentApi.getContactInfo();
        if (data) setContactInfo(data);
      } catch {
        // Silent fail
      }
    };
    fetchData();
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home', 'Ana Sayfa') },
    { path: '/about', label: t('nav.about', 'Hakkımda') },
    { path: '/methods', label: t('nav.methods', 'Yöntemler') },
    { path: '/blog', label: t('nav.blog', 'Blog') },
    { path: '/podcast', label: t('nav.podcast', 'Podcast') },
    { path: '/booking', label: t('nav.booking', 'Randevu') },
    { path: '/contact', label: t('nav.contact', 'İletişim') },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer group min-w-[120px]">
            {contactInfo?.logo_url && (
              <img
                src={contactInfo.logo_url}
                alt="Reset Logo"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap hover-underline ${isActive(link.path)
                  ? 'text-[#D4AF37]'
                  : 'text-gray-700 hover:text-[#D4AF37]'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center space-x-4 ml-4">
              {/* Language Switcher */}
              <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                <button
                  onClick={() => i18n.changeLanguage('tr')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${i18n.language && i18n.language.startsWith('tr')
                    ? 'bg-[#D4AF37] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  TR
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${i18n.language && i18n.language.startsWith('en')
                    ? 'bg-[#D4AF37] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  EN
                </button>
              </div>

              <Link
                to="/youtube"
                className="flex items-center space-x-2 bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors duration-200 font-medium items-center"
              >
                <i className="ri-youtube-fill text-xl"></i>
                <span>YouTube</span>
              </Link>

              <Link
                to="/login"
                className="bg-[#D4AF37] text-[#1A1A1A] px-6 py-2 font-medium whitespace-nowrap cursor-pointer transition-all duration-200 hover:bg-[#C19B2E] hover-lift rounded-lg"
              >
                {t('auth.login', 'Giriş Yap')}
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className={`ri-${mobileMenuOpen ? 'close' : 'menu'}-line text-2xl text-[#1A1A1A]`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-base font-medium cursor-pointer ${isActive(link.path)
                  ? 'text-[#D4AF37]'
                  : 'text-gray-700'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
              <Link
                to="/youtube"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                <i className="ri-youtube-fill text-xl"></i>
                <span>YouTube</span>
              </Link>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 bg-[#D4AF37] text-[#1A1A1A] px-6 py-3 font-medium text-center cursor-pointer rounded-lg"
              >
                {t('auth.login', 'Giriş Yap')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
