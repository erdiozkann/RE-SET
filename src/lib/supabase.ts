import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// ============================================
// 🔌 SUPABASE CLIENT
// ============================================
// Auth işlemleri için: src/contexts/AuthContext.tsx kullanın (useAuth hook)

declare global {
    var supabaseInstance: any;
    var supabasePublicInstance: any;
}

// Singleton implementation to ensure only one instance exists across all modules
const getSupabaseInstance = () => {
    if (globalThis.supabaseInstance) return globalThis.supabaseInstance;
    
    const client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    globalThis.supabaseInstance = client;
    return client;
};

export const supabase = getSupabaseInstance();

// 🌍 PUBLIC CLIENT (RLS Bypass for Read-Only)
const getSupabasePublicInstance = () => {
    if (globalThis.supabasePublicInstance) return globalThis.supabasePublicInstance;
    
    const client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        // storageKey İZOLASYONU ŞART: varsayılan anahtar auth client'la AYNI
        // navigator.locks kilidini paylaşıyor. Panel sekmesi açıkken (veya token
        // yenilenirken) asıl client'ın getSession'ı kilidi tutunca, public içerik
        // sorguları da (hero/services/methods...) ~8-9sn kuyrukta bekliyordu →
        // "site 10sn açılıyor" şikayetinin kök nedeni buydu.
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'sb-reset-public' }
    });
    globalThis.supabasePublicInstance = client;
    return client;
};

export const supabasePublic = getSupabasePublicInstance();
