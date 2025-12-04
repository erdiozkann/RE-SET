import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img 
              src="https://static.readdy.ai/image/6c432e190935318471b81dba0ca536b3/f8cacb0d1ad0c1f4f6e313d7c034bd99.png" 
              alt="Reset Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive(link.path)
                    ? 'text-[#D4AF37]'
                    : 'text-gray-700 hover:text-[#D4AF37]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="bg-[#D4AF37] text-[#1A1A1A] px-6 py-2 font-medium whitespace-nowrap cursor-pointer transition-all hover:bg-[#C19B2E]"
            >
              Giriş Yap
            </Link>
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
                className={`block py-2 text-base font-medium cursor-pointer ${
                  isActive(link.path)
                    ? 'text-[#D4AF37]'
                    : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block bg-[#D4AF37] text-[#1A1A1A] px-6 py-3 font-medium text-center cursor-pointer"
            >
              Giriş Yap
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
