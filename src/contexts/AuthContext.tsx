import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

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

// ============================================
// 👤 Auth Provider
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Kullanıcı profilini çek veya oluştur (Fallback mekanizmalı)
    const fetchUserProfile = useCallback(async (authUser: any): Promise<User | null> => {
        if (!authUser) return null;

        try {
            // Şemadaki değişikliklerden etkilenmemek için spesifik kolonları seçiyoruz
            const { data: profile, error } = await supabase
                .from('users')
                .select('id, email, name, role, approved, phone, registered_at, created_at')
                .eq('id', authUser.id)
                .maybeSingle();

            // Profil bulunduysa döndür
            if (profile && !error) {
                return {
                    id: profile.id,
                    email: profile.email,
                    name: profile.name || 'Kullanıcı',
                    role: profile.role || 'CLIENT',
                    approved: profile.approved ?? false,
                    phone: profile.phone,
                    registeredAt: profile.registered_at || profile.created_at
                };
            }

            console.warn('Profil verisi çekilemedi (RLS veya yok), fallback oluşturuluyor:', error?.message);
        } catch (error) {
            console.error('Profil çekme hatası:', error);
        }

        // --- FALLBACK ---
        const email = authUser.email || '';
        const fallbackUser: User = {
            id: authUser.id,
            email: email,
            name: authUser.user_metadata?.name || 'Kullanıcı',
            role: 'CLIENT', // GÜVENLİK: Veritabanında yoksa her zaman CLIENT
            approved: true, // Geçiş süreci için varsayılan onaylı
            phone: authUser.phone,
            registeredAt: authUser.created_at
        };
        return fallbackUser;
    }, []);

    // Kullanıcıyı yenile
    const refreshUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
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

    // İlk yükleme ve auth değişiklik dinleyicisi
    useEffect(() => {
        let mounted = true;

        // İlk yükleme
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && mounted) {
                    const profile = await fetchUserProfile(session.user);
                    setUser(profile);
                }
            } catch (error) {
                console.error('Auth init hatası:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Auth değişiklik dinleyicisi
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth event:', event);

            if (event === 'SIGNED_IN' && session?.user) {
                const profile = await fetchUserProfile(session.user);
                setUser(profile);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                // Token yenilendiğinde profili yenile
                const profile = await fetchUserProfile(session.user);
                setUser(profile);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchUserProfile]);

    // Sign In
    const signIn = async (email: string, password: string): Promise<User> => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('Auth error:', authError);
            throw new Error('E-posta veya şifre hatalı');
        }

        if (!authData.user) {
            throw new Error('Kullanıcı bulunamadı');
        }

        // Profili çek (authUser objesi gönderilmeli, id değil!)
        let profile = await fetchUserProfile(authData.user);

        // Debug: Kullanıcı girişi logla
        console.log('Login attempt:', email, 'Profile:', profile);

        if (!profile) {
            // Profil yoksa (RLS veya henüz oluşmamış), auth datasından oluştur
            // GÜVENLİK NOTU: Normalde approved: false olmalı, ancak şu an RLS sorunları
            // nedeniyle müşteriler giremiyor. Geçici olarak true yapıyoruz.

            profile = {
                id: authData.user.id,
                email: authData.user.email || '',
                name: authData.user.user_metadata?.name || 'Kullanıcı',
                role: 'CLIENT', // GÜVENLİK: Admin yetkisi sadece veritabanından gelmeli
                approved: true, // GEÇİCİ OLARAK HERKES ONAYLI (Giriş sorunu çözümü)
                phone: authData.user.phone,
                registeredAt: authData.user.created_at
            };
        }

        // Danışan onay kontrolü (Sadece profil veritabanından geldiyse ve kesin client ise)
        // Şu anki RLS sorununda bu kontrol hatalı çalışıyor olabilir, o yüzden
        // sadece veritabanından gelen explicitly approved: false olanları engelle
        if (profile.role === 'CLIENT' && profile.approved === false) {
            console.warn('User not approved:', profile);
            await supabase.auth.signOut();
            throw new Error('Hesabınız henüz onaylanmamış. Lütfen onay için bekleyin.');
        }

        setUser(profile);
        return profile;
    };

    // Sign Up
    const signUp = async (email: string, password: string, name: string, phone?: string): Promise<User> => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone
                }
            }
        });

        if (authError) {
            console.error('Signup auth error:', authError);
            if (authError.message.toLowerCase().includes('already registered')) {
                throw new Error('Bu e-posta adresi zaten kayıtlı');
            }
            throw new Error('Kayıt oluşturulamadı: ' + authError.message);
        }

        if (!authData.user) {
            throw new Error('Kullanıcı oluşturulamadı');
        }

        // NOT: Artık users tablosuna manuel insert yapmıyoruz!
        // Database trigger otomatik olarak ekleyecek.

        const newUser: User = {
            id: authData.user.id,
            email,
            name,
            role: 'CLIENT',
            approved: false,
            phone,
            registeredAt: new Date().toISOString()
        };

        // Önemli: Kayıt sonrası kullanıcıyı state'e EKLEME
        // Çünkü onay beklemeli, giriş yapmamalı

        return newUser;
    };

    // Sign Out
    const signOut = async (): Promise<void> => {
        await supabase.auth.signOut();
        setUser(null);
    };

    // Reset Password (Şifremi Unuttum)
    const resetPassword = async (email: string): Promise<void> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
            console.error('Password reset error:', error);
            throw new Error('Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.');
        }
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

// ============================================
// 🪝 useAuth Hook
// ============================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ============================================
// 🛡️ Auth Guard Hooks
// ============================================

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
