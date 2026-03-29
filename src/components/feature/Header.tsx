import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { contentApi } from '../../lib/api';
import type { ContactInfo } from '../../types';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const location = useLocation();



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
    { path: '/', label: 'Ana Sayfa' },
    { path: '/about', label: 'Hakkımda' },
    { path: '/methods', label: 'Yöntemler' },
    { path: '/blog', label: 'Blog' },
    { path: '/podcast', label: 'Podcast' },
    { path: '/booking', label: 'Randevu' },
    { path: '/contact', label: 'İletişim' },
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
              {/* YouTube and Login */}

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
                Giriş Yap
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
                Giriş Yap
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
