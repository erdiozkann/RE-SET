import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// ============================================
// 🔌 SUPABASE CLIENT
// ============================================
// Auth işlemleri için: src/contexts/AuthContext.tsx kullanın (useAuth hook)

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
