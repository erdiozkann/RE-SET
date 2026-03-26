export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  DEMO_EMAIL: import.meta.env.VITE_DEMO_EMAIL || 'info@re-set.com.tr',
  DEMO_PASSWORD: import.meta.env.VITE_DEMO_PASSWORD || '123456',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Validation to catch missing keys early but without crashing during dynamic access failure
if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    if (env.isProd) {
        console.error('CRITICAL: Supabase keys are missing in production build!');
    }
}

