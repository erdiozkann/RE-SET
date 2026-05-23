// Google Analytics 4 — ENV-driven, no-op when VITE_GA_ID is unset.
//
// Yapısı Clarity ile aynıdır: tek seferlik init, idempotent, ID yoksa hiçbir
// şey yüklenmez. Consent Mode v2 default'u index.html'de "denied" başlatır;
// cookie banner kabulü sonrası consent('update', ...) çağrısıyla açılır.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gaInitialized = false;

export const initGA = (): void => {
  if (gaInitialized) return;

  const gaId = (import.meta.env.VITE_GA_ID as string | undefined)?.trim();
  if (!gaId) {
    if (import.meta.env.DEV) {
      console.info('[GA4] VITE_GA_ID tanımlı değil, script yüklenmeyecek.');
    }
    return;
  }

  // gtag stub
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function (...args: unknown[]) {
      window.dataLayer!.push(args);
    };

  // Script
  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-ga-id="${gaId}"]`
  );
  if (!existing) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.setAttribute('data-ga-id', gaId);
    const first = document.getElementsByTagName('script')[0];
    first?.parentNode?.insertBefore(script, first);
  }

  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    anonymize_ip: true,
    transport_type: 'beacon',
    send_page_view: true,
  });

  gaInitialized = true;
};

// Cookie banner kabulü sonrası bu fonksiyon çağrılmalı.
export const grantAnalyticsConsent = (): void => {
  if (!window.gtag) return;
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
  });
};

export const denyAnalyticsConsent = (): void => {
  if (!window.gtag) return;
  window.gtag('consent', 'update', {
    analytics_storage: 'denied',
  });
};

// SPA route değişiminde manuel page_view göndermek için.
export const trackPageView = (path: string): void => {
  if (!window.gtag) return;
  const gaId = (import.meta.env.VITE_GA_ID as string | undefined)?.trim();
  if (!gaId) return;
  window.gtag('config', gaId, { page_path: path });
};
