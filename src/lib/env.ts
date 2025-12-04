const getEnv = (key: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const env = {
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
  SUPABASE_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
  DEMO_EMAIL: import.meta.env.VITE_DEMO_EMAIL || 'info@re-set.com.tr',
  DEMO_PASSWORD: import.meta.env.VITE_DEMO_PASSWORD || '123456',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
