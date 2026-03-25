import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// ============================================
// 🔌 SUPABASE CLIENT
// ============================================
// Auth işlemleri için: src/contexts/AuthContext.tsx kullanın (useAuth hook)

// Singleton implementation to prevent Multiple GoTrueClient instances
const createSupabaseClient = () => createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

declare global {
    var supabaseInstance: ReturnType<typeof createSupabaseClient> | undefined;
}

export const supabase = globalThis.supabaseInstance ?? createSupabaseClient();

if (import.meta.env.DEV) {
    globalThis.supabaseInstance = supabase;
}

// 🌍 PUBLIC CLIENT (RLS Bypass for Read-Only)
// This client forces 'anon' role by disabling session persistence.
// Use this for fetching public data (Hero, Content, Services) so Admins can see it 
// even if RLS policies for 'authenticated' are broken.
export const supabasePublic = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});
