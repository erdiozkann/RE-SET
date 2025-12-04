import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookieConsent');
    setConsent(stored);
    if (!stored) {
      // show banner with slight delay so it doesn't compete with initial paint
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setConsent('accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setConsent('rejected');
    setVisible(false);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => setShowSettings(false);

  // Render nothing when banner should be hidden
  if (!visible) return null;

  return (
    <div id="cookie-banner" className="cookie-banner" role="dialog" aria-live="polite">
      <div className="cookie-content">
        <h3>Çerez Ayarları</h3>
        <p>
          Size daha iyi bir deneyim sunmak için çerezleri kullanıyoruz. <a href="/cookies">Çerez Politikası</a>, <a href="/privacy">Gizlilik Politikası</a> ve <a href="/kvkk">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.
        </p>

        <div className="cookie-buttons">
          <button id="cookie-accept" onClick={accept}>Kabul Et</button>
          <button id="cookie-reject" onClick={reject}>Reddet</button>
          <button id="cookie-settings" onClick={openSettings}>Ayarları Özelleştir</button>
        </div>
      </div>

      {showSettings && (
        <div className="cookie-modal-backdrop" onMouseDown={closeSettings}>
          <div className="cookie-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cookie-modal-head">
              <h4>Çerez Tercihleri</h4>
              <button className="cookie-modal-close" onClick={closeSettings} aria-label="Kapat">✕</button>
            </div>
            <div className="cookie-modal-body">
              <p className="text-sm text-gray-600">Zorunlu çerezler her zaman aktiftir. İsteğe bağlı çerezleri buradan yönetebilirsiniz.</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analitik Çerezleri</p>
                    <p className="text-xs text-gray-500">Site kullanımını analiz etmek için</p>
                  </div>
                  <div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked={consent === 'accepted'} onChange={(e) => {
                        if (e.target.checked) accept(); else reject();
                      }} />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="cookie-modal-foot">
              <button className="btn" onClick={closeSettings}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
