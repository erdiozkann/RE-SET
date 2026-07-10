const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validation to catch missing keys early but without crashing during dynamic access failure
if (!url || !key) {
  if (import.meta.env.PROD) {
    console.error('CRITICAL: Supabase keys are missing in production build!');
  }
}

export const env = {
  // Boş URL createClient'ı MODÜL IMPORT'unda fırlatır → tüm uygulama beyaz
  // sayfada kalır (CI smoke testleri bunu yakaladı). Env eksikse sözdizimsel
  // geçerli bir placeholder ver: kabuk render olur, veri sorguları zaten
  // catch/fallback yollarına düşer.
  SUPABASE_URL: url || 'https://env-missing.supabase.co',
  SUPABASE_KEY: key || 'env-missing-anon-key',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
