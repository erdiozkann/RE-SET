import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

// Helper: Timeout wrapper to prevent hanging Promises.
// The timer is cleared as soon as the action settles so it doesn't keep a
// reference alive (this was leaking one timer per call before).
const withTimeout = <T,>(action: () => Promise<T> | PromiseLike<T>, ms = 15000, msg = 'Sunucu yanıt vermedi (Zaman aşımı)'): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error(msg)), ms);
        Promise.resolve(action()).then(
            (value) => {
                clearTimeout(timeoutId);
                resolve(value);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            },
        );
    });
};

// ============================================
// 🔐 AUTH CONTEXT - Merkezi Kimlik Yönetimi
// ============================================

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signUp: (email: string, password: string, name: string, phone?: string) => Promise<User>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ROLE_CACHE_KEY = 'reset:last-role-by-user:v2';
const LEGACY_ROLE_CACHE_KEY = 'reset:last-role-by-user';

const readRoleCache = (): Record<string, User['role']> => {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(ROLE_CACHE_KEY);
        if (raw) {
            return JSON.parse(raw) as Record<string, User['role']>;
        }

        const legacyRaw = localStorage.getItem(LEGACY_ROLE_CACHE_KEY);
        if (!legacyRaw) return {};
        const legacyParsed = JSON.parse(legacyRaw) as Record<string, User['role']>;
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(legacyParsed));
        return legacyParsed;
    } catch {
        return {};
    }
};

const writeRoleCache = (userId: string, role: User['role']) => {
    if (typeof window === 'undefined' || !userId) return;
    try {
        const cache = readRoleCache();
        cache[userId] = role;
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // noop
    }
};

const getCachedRole = (userId?: string): User['role'] | null => {
    if (!userId) return null;
    const cache = readRoleCache();
    return cache[userId] || null;
};

const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    email: profile.email,
    name: profile.name || 'Kullanıcı',
    role: profile.role || 'CLIENT',
    approved: profile.approved ?? false,
    phone: profile.phone,
    registeredAt: profile.registered_at || profile.created_at
});

// Helper: Clean stale sessions from other Supabase projects
const cleanStaleSessions = (currentUrl: string) => {
    try {
        const projectId = currentUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
        if (!projectId) return;

        const allKeys = Object.keys(localStorage);
        const staleKeys = allKeys.filter(key =>
            key.startsWith('sb-') &&
            key.includes('-auth-token') &&
            !key.includes(projectId)
        );

        if (staleKeys.length > 0) {
            console.warn('Cleaning up stale Supabase sessions:', staleKeys);
            staleKeys.forEach(key => localStorage.removeItem(key));
        }
    } catch (e) {
        console.error('Session cleanup error:', e);
    }
};

// ============================================
// 👤 Auth Provider
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (authUser: any): Promise<User | null> => {
        if (!authUser) return null;

        // 1. Try to fetch from DB (No Timeout Race)
        try {
            const { data: profile, error } = await withTimeout(() => supabase
                .from('users')
                .select('id, email, name, role, approved, phone, registered_at, created_at')
                .eq('id', authUser.id)
                .maybeSingle(), 8000, 'Kullanıcı profili alınamadı');

            if (profile && !error) {
                const profileData = mapProfileToUser(profile);
                writeRoleCache(profileData.id, profileData.role);
                return profileData;
            }
        } catch (error) {
            console.warn('DB Fetch failed, trying fallback:', error);
        }

        // 2. Fallback: Trust Auth Metadata
        // GÜVENLİK: yalnızca app_metadata (server-only) + sabit admin e-postası.
        // user_metadata KULLANICI TARAFINDAN YAZILABİLİR — asla yetki kaynağı olamaz.
        const appRole = authUser.app_metadata?.role;
        const isHardcodedAdmin = authUser.email && authUser.email.toLowerCase() === 'info@re-set.com.tr';
        const isAdmin = (appRole === 'ADMIN') || isHardcodedAdmin;

        const fallbackRole: User['role'] = isAdmin ? 'ADMIN' : (getCachedRole(authUser.id) || 'CLIENT');

        console.warn(`⚠️ Using Fallback Profile for ${authUser.email}. Resolved Role: ${fallbackRole}`);

        return {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'Kullanıcı',
            role: fallbackRole,
            approved: fallbackRole === 'ADMIN',
            phone: authUser.phone,
            registeredAt: authUser.created_at
        };
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const { data: { session } } = await withTimeout(() => supabase.auth.getSession(), 15000);
            if (session?.user) {
                const profile = await fetchUserProfile(session.user);
                setUser(profile);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Kullanıcı yenileme hatası:', error);
            setUser(null);
        }
    }, [fetchUserProfile]);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // 🧹 Stale Session Cleanup
            cleanStaleSessions(import.meta.env.VITE_SUPABASE_URL || 'woaenxpydppxyfphwdix');

            // ⚡ Anonim ziyaretçi hızlı çıkışı: localStorage'da Supabase auth token yoksa
            //    oturum da yoktur → getSession ağ çağrısını ATLA (LCP'yi kritik yoldan kurtarır).
            //    %99 pazarlama ziyaretçisi giriş yapmamıştır; onlar için ağ turu gereksiz.
            try {
                const hasStoredSession =
                    typeof window !== 'undefined' &&
                    Object.keys(window.localStorage).some((k) => /^sb-.*-auth-token$/.test(k));
                if (!hasStoredSession) {
                    if (mounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }
            } catch {
                /* localStorage erişilemezse (gizli mod vb.) normal akışa düş */
            }

            try {
                // 1. Get Session — 15sn: sekmeler arası navigator.locks kilidini
                // token yenilemesi (_recoverAndRefresh) tutarken 8sn yetmiyordu;
                // timeout olsa bile onAuthStateChange (TOKEN_REFRESHED/SIGNED_IN)
                // oturumu sonradan teslim eder — bu yüzden hata değil uyarıdır.
                const { data: { session }, error } = await withTimeout(() => supabase.auth.getSession(), 15000);

                if (error) throw error;
                if (!mounted) return;

                if (session?.user) {
                    const profile = await fetchUserProfile(session.user);
                    if (mounted) setUser(profile);
                } else {
                    if (mounted) setUser(null);
                }
            } catch (error) {
                console.warn('Auth init gecikti (oturum onAuthStateChange ile kurtarılır):', error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            // Only handle specific events that change user state
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (session?.user) {
                    const profile = await fetchUserProfile(session.user);
                    if (mounted) setUser(profile);
                }
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    setLoading(false); // Ensure loading is false on sign out
                }
                localStorage.removeItem(ROLE_CACHE_KEY);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchUserProfile]);

    const signIn = async (email: string, password: string): Promise<User> => {
        const { data: authData, error: authError } = await withTimeout(() => supabase.auth.signInWithPassword({
            email,
            password
        }), 8000, 'Giriş işlemi zaman aşımına uğradı');

        if (authError) throw new Error('E-posta veya şifre hatalı');
        if (!authData.user) throw new Error('Kullanıcı bulunamadı');

        let profile = await fetchUserProfile(authData.user);

        if (!profile) {
            profile = {
                id: authData.user.id,
                email: authData.user.email || '',
                name: authData.user.user_metadata?.name || 'Kullanıcı',
                role: 'CLIENT',
                approved: false,
                phone: authData.user.phone,
                registeredAt: authData.user.created_at
            };
        }

        if (profile.role !== 'ADMIN' && profile.approved === false) {
            // Auto-approve bypass only runs in local DEV builds. In production
            // we always require an explicit admin approval — never trust the
            // email domain or hostname as a security boundary.
            const allowAutoApprove =
                import.meta.env.DEV &&
                typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1');

            if (!allowAutoApprove) {
                throw new Error('Hesabınız henüz yönetici tarafından onaylanmamış.');
            }
        }

        setUser(profile);
        return profile;
    };

    const signUp = async (email: string, password: string, name: string, phone?: string): Promise<User> => {
        const { data: authData, error: authError } = await withTimeout(() => supabase.auth.signUp({
            email,
            password,
            options: { data: { name, phone } }
        }), 10000, 'Kayıt işlemi zaman aşımına uğradı');

        if (authError) {
            if (authError.message.toLowerCase().includes('already registered')) {
                throw new Error('Bu e-posta adresi zaten kayıtlı');
            }
            throw new Error('Kayıt oluşturulamadı: ' + authError.message);
        }

        if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

        // Same rule as signIn: auto-approve only in DEV. Prod accounts always
        // require an explicit admin approval before they're treated as active.
        const shouldAutoApprove =
            import.meta.env.DEV &&
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1');

        return {
            id: authData.user.id,
            email,
            name,
            role: 'CLIENT',
            approved: shouldAutoApprove,
            phone,
            registeredAt: new Date().toISOString()
        };
    };

    const signOut = async (): Promise<void> => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const resetPassword = async (email: string): Promise<void> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw new Error('Şifre sıfırlama e-postası gönderilemedi.');
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useRequireAuth() {
    const { user, loading } = useAuth();
    return { user, loading, isAuthenticated: !!user };
}

export function useRequireAdmin() {
    const { user, loading } = useAuth();
    return {
        user,
        loading,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user
    };
}
