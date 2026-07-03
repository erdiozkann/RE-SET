import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { ClarityCommand } from '../../lib/clarity';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  // GDPR/KVKK requires advertising/targeting consent to be separate from analytics.
  // analytics_storage  → analytics
  // ad_storage, ad_user_data, ad_personalization → marketing
  marketing: boolean;
}

const STORAGE_KEY = 'cookieConsent';
const DATE_KEY = 'cookieConsentDate';
// Re-prompt the user 12 months after the last decision (KVKK/GDPR best practice).
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;
const CONSENT_EVENT = 'cookie-consent-changed';
const OPEN_EVENT = 'cookie-settings-open';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const safeLocalStorage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore quota / private-browsing errors */
    }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const deserializePreferences = (rawValue: string | null): CookiePreferences | null => {
  if (!rawValue) return null;
  // Legacy "accepted" string predates the split — it implies all categories on,
  // including marketing, since that's what the user clicked at the time.
  if (rawValue === 'accepted')
    return { necessary: true, analytics: true, functional: true, marketing: true };
  if (rawValue === 'rejected')
    return { necessary: true, analytics: false, functional: false, marketing: false };
  try {
    const parsed = JSON.parse(rawValue) as Partial<CookiePreferences>;
    if (parsed && typeof parsed === 'object') {
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        functional: Boolean(parsed.functional),
        // Older stored records won't have `marketing`; default to false (safest under KVKK).
        marketing: Boolean(parsed.marketing),
      };
    }
  } catch {
    return null;
  }
  return null;
};

const isConsentExpired = (): boolean => {
  const dateStr = safeLocalStorage.get(DATE_KEY);
  if (!dateStr) return true;
  const ts = Date.parse(dateStr);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > CONSENT_TTL_MS;
};

// Focusable selector for focus-trap inside the dialog.
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  // Snapshot of the saved consent at the moment the banner became visible.
  // Lets the X button distinguish "first-time user, no consent on record"
  // (→ return to initial accept/reject screen) from "user already decided,
  // just popped settings open from Footer" (→ hide the banner entirely).
  const savedPreferencesRef = useRef<CookiePreferences | null>(null);
  const location = useLocation();

  const applyConsent = useCallback((prefs: CookiePreferences) => {
    // Google Consent Mode v2 — KVKK/GDPR mandates separating analytics from advertising.
    window.gtag?.('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      ad_user_data: prefs.marketing ? 'granted' : 'denied',
      ad_personalization: prefs.marketing ? 'granted' : 'denied',
    });
    // Microsoft Clarity is purely behavioral analytics — tied to the analytics toggle.
    if (window.clarity) {
      if (prefs.analytics) window.clarity('consent');
      else window.clarity('stop');
    }
    // Broadcast for any third-party listener (GTM dataLayer push, custom integrations, etc.)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: prefs }));
  }, []);

  // Discard unsaved toggles and either return to the initial banner (first
  // visit, no saved decision) or hide entirely (decision on record).
  const handleCloseSettings = useCallback(() => {
    const saved = savedPreferencesRef.current;
    if (saved) {
      setPreferences(saved);
      setShowSettings(false);
      setShowBanner(false);
    } else {
      setPreferences(DEFAULT_PREFERENCES);
      setShowSettings(false);
    }
  }, []);

  // Load + apply saved preferences on mount; re-prompt if expired.
  useEffect(() => {
    const stored = safeLocalStorage.get(STORAGE_KEY);
    const saved = deserializePreferences(stored);

    if (!saved || isConsentExpired()) {
      if (stored) safeLocalStorage.remove(STORAGE_KEY);
      savedPreferencesRef.current = null;
      setShowBanner(true);
      return;
    }

    setPreferences(saved);
    savedPreferencesRef.current = saved;
    applyConsent(saved);
  }, [applyConsent]);

  // Allow other parts of the app (e.g. Footer "Çerez Ayarları") to re-open the
  // settings panel without forcing a page reload.
  useEffect(() => {
    const open = () => {
      // Refresh the saved snapshot before showing the panel so X restores the
      // user's last decision instead of the in-memory default.
      const stored = safeLocalStorage.get(STORAGE_KEY);
      const saved = deserializePreferences(stored);
      if (saved) {
        savedPreferencesRef.current = saved;
        setPreferences(saved);
      }
      setShowBanner(true);
      setShowSettings(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    window.openCookieSettings = open;
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      if (window.openCookieSettings === open) {
        delete window.openCookieSettings;
      }
    };
  }, []);

  // If the user clicks the "Çerez Politikamızı" link while the banner is open,
  // close the banner so they can read the policy without the modal scroll
  // lock fighting them. They can reopen via Footer when ready.
  useEffect(() => {
    if (showBanner && location.pathname === '/cookies') {
      setShowBanner(false);
      setShowSettings(false);
    }
  }, [location.pathname, showBanner]);

  // Body scroll lock while the dialog is open. Defensively skipped on /cookies
  // (the route effect above should already have closed the banner).
  useEffect(() => {
    if (!showBanner) return;
    if (location.pathname === '/cookies') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showBanner, location.pathname]);

  // Capture-and-restore focus is keyed on showBanner ONLY. Re-capturing on
  // every showSettings toggle would record an element inside the dialog
  // itself as the "previous" focus target.
  useEffect(() => {
    if (!showBanner) return;
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) || null;
    return () => {
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    };
  }, [showBanner]);

  // Focus trap + initial focus + ESC handling. Re-binds when the rendered
  // dialog subtree swaps (banner ↔ settings). The handler queries the live
  // dialog ref on every keypress so it survives dynamic DOM mutations.
  useEffect(() => {
    if (!showBanner) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const initialFocusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
    initialFocusables[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      const current = dialogRef.current;
      if (!current) return;

      if (e.key === 'Escape') {
        // ESC mirrors the X button — same close semantics. The initial banner
        // (no saved consent) ignores ESC because consent must be deliberate.
        if (showSettings) {
          e.stopPropagation();
          handleCloseSettings();
        }
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = Array.from(current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showBanner, showSettings, handleCloseSettings]);

  const savePreferences = useCallback(
    (prefs: CookiePreferences) => {
      safeLocalStorage.set(STORAGE_KEY, JSON.stringify(prefs));
      safeLocalStorage.set(DATE_KEY, new Date().toISOString());
      applyConsent(prefs);
      setPreferences(prefs);
      savedPreferencesRef.current = prefs;
      setShowBanner(false);
      setShowSettings(false);
    },
    [applyConsent],
  );

  const handleAcceptAll = () =>
    savePreferences({ necessary: true, analytics: true, functional: true, marketing: true });

  const handleRejectAll = () =>
    savePreferences({ necessary: true, analytics: false, functional: false, marketing: false });

  const handleSavePreferences = () => savePreferences(preferences);

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="cookie-dialog"
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="max-w-4xl mx-auto">
            {!showSettings ? (
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-banner-title"
                aria-describedby="cookie-banner-desc"
                className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 flex items-center justify-center bg-[#D4AF37]/10 rounded-lg mr-4"
                      aria-hidden="true"
                    >
                      <i className="ri-cookie-line text-2xl text-[#D4AF37]"></i>
                    </div>
                    <div>
                      <h3
                        id="cookie-banner-title"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Çerez Kullanımı
                      </h3>
                      <p id="cookie-banner-desc" className="text-sm text-gray-600 mt-1">
                        Web sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Daha fazla bilgi için{' '}
                  <Link
                    to="/cookies"
                    className="text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Çerez Politikamızı
                  </Link>{' '}
                  inceleyebilirsiniz.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors font-medium whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
                  >
                    Tümünü Kabul Et
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Ayarlar
                  </button>
                </div>
              </div>
            ) : (
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-settings-title"
                className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 id="cookie-settings-title" className="text-xl font-semibold text-gray-900">
                    Çerez Tercihleri
                  </h3>
                  <button
                    onClick={handleCloseSettings}
                    aria-label="Ayarlar panelini kapat"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                  >
                    <i className="ri-close-line text-xl" aria-hidden="true"></i>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Hangi çerezlerin kullanılmasına izin vermek istediğinizi seçebilirsiniz. Daha
                  fazla bilgi için{' '}
                  <Link
                    to="/cookies"
                    className="text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Çerez Politikamızı
                  </Link>{' '}
                  inceleyebilirsiniz.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <h4 id="cookie-necessary-label" className="font-semibold text-gray-900">
                          Zorunlu Çerezler
                        </h4>
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          Her Zaman Aktif
                        </span>
                      </div>
                      {/* Real <button disabled> keeps the switch reachable for
                          screen readers without the focusable-span hack. */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked="true"
                        aria-disabled="true"
                        aria-labelledby="cookie-necessary-label"
                        disabled
                        className="w-12 h-6 bg-gray-300 rounded-full relative cursor-not-allowed"
                      >
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full block"></span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Bu çerezler
                      devre dışı bırakılamaz.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 id="cookie-analytics-label" className="font-semibold text-gray-900">
                        Performans ve Analitik Çerezler
                      </h4>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={preferences.analytics}
                        aria-labelledby="cookie-analytics-label"
                        onClick={() => handlePreferenceChange('analytics')}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 ${
                          preferences.analytics ? 'bg-[#D4AF37]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform block ${
                            preferences.analytics ? 'right-1' : 'left-1'
                          }`}
                        ></span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Web sitesinin performansını ölçmek ve iyileştirmek için kullanılır. Google
                      Analytics ve Microsoft Clarity gibi araçları içerir.
                    </p>
                    <p className="text-xs text-gray-500">
                      Kullanılan araçlar: Google Analytics, Microsoft Clarity
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 id="cookie-functional-label" className="font-semibold text-gray-900">
                        İşlevsellik Çerezleri
                      </h4>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={preferences.functional}
                        aria-labelledby="cookie-functional-label"
                        onClick={() => handlePreferenceChange('functional')}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 ${
                          preferences.functional ? 'bg-[#D4AF37]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform block ${
                            preferences.functional ? 'right-1' : 'left-1'
                          }`}
                        ></span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tercihlerinizi hatırlamak ve size daha kişiselleştirilmiş bir deneyim sunmak
                      için kullanılır.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 id="cookie-marketing-label" className="font-semibold text-gray-900">
                        Pazarlama ve Hedefleme Çerezleri
                      </h4>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={preferences.marketing}
                        aria-labelledby="cookie-marketing-label"
                        onClick={() => handlePreferenceChange('marketing')}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 ${
                          preferences.marketing ? 'bg-[#D4AF37]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform block ${
                            preferences.marketing ? 'right-1' : 'left-1'
                          }`}
                        ></span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      İlgi alanlarınıza yönelik reklamları göstermek, kampanya performansını ölçmek
                      ve farklı sitelerde sizinle tekrar iletişime geçmek için kullanılır.
                    </p>
                    <p className="text-xs text-gray-500">
                      Google Consent Mode: ad_storage, ad_user_data, ad_personalization
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2.5 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors font-medium whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
                  >
                    Tercihleri Kaydet
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Type declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: ClarityCommand;
    openCookieSettings?: () => void;
  }
}
