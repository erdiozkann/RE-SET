import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ClarityCommand } from '../../lib/clarity';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      applyConsent(savedPreferences);
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    // Google Analytics
    if (prefs.analytics) {
      enableGoogleAnalytics();
      enableMicrosoftClarity();
    } else {
      disableGoogleAnalytics();
      disableMicrosoftClarity();
    }
  };

  const enableGoogleAnalytics = () => {
    // Google Analytics will be enabled via index.html
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted'
    });
  };

  const disableGoogleAnalytics = () => {
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied'
    });
  };

  const enableMicrosoftClarity = () => {
    // Microsoft Clarity will be enabled via index.html
    if (window.clarity) {
      window.clarity('consent');
    }
  };

  const disableMicrosoftClarity = () => {
    // Disable Clarity tracking
    if (window.clarity) {
      window.clarity('stop');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      functional: true
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      functional: false
    };
    savePreferences(onlyNecessary);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    applyConsent(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-4xl">
        {!showSettings ? (
          // Simple Banner
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#D4AF37]/10 rounded-lg mr-4">
                  <i className="ri-cookie-line text-2xl text-[#D4AF37]"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Çerez Kullanımı</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Sitemizi kullanarak, <Link to="/cookies" className="text-[#D4AF37] hover:underline cursor-pointer">Çerez Politikamızı</Link> kabul etmiş olursunuz. Çerezler, site performansını analiz etmek ve size daha iyi hizmet sunmak için kullanılır.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                Tümünü Kabul Et
              </button>
              <button
                onClick={handleRejectAll}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                Reddet
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                Ayarlar
              </button>
            </div>
          </div>
        ) : (
          // Settings Panel
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Çerez Tercihleri</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Hangi çerezlerin kullanılmasına izin vermek istediğinizi seçebilirsiniz. Daha fazla bilgi için <Link to="/cookies" className="text-[#D4AF37] hover:underline cursor-pointer">Çerez Politikamızı</Link> inceleyebilirsiniz.
            </p>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-900">Zorunlu Çerezler</h4>
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Her Zaman Aktif</span>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-not-allowed">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Bu çerezler devre dışı bırakılamaz.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Performans ve Analitik Çerezler</h4>
                  <button
                    onClick={() => handlePreferenceChange('analytics')}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                      preferences.analytics ? 'bg-[#D4AF37]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.analytics ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Web sitesinin performansını ölçmek ve iyileştirmek için kullanılır. Google Analytics ve Microsoft Clarity gibi araçları içerir.
                </p>
                <p className="text-xs text-gray-500">
                  Kullanılan araçlar: Google Analytics, Microsoft Clarity
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">İşlevsellik Çerezleri</h4>
                  <button
                    onClick={() => handlePreferenceChange('functional')}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                      preferences.functional ? 'bg-[#D4AF37]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.functional ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Tercihlerinizi hatırlamak ve size daha kişiselleştirilmiş bir deneyim sunmak için kullanılır.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                Tercihleri Kaydet
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Type declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: ClarityCommand;
  }
}
