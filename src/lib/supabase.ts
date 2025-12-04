import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { AuthError } from './errors';
import type { User } from '../types';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// Auth helper fonksiyonları
export const authHelpers = {
  async signIn(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Giriş deneniyor:', email);
      
      // Direkt users tablosundan kullanıcıyı al
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('🔐 Users sorgu sonucu:', { user, userError });

      if (userError) {
        console.error('🔐 User fetch hatası:', userError);
        throw new AuthError('Veritabanı hatası: ' + userError.message, 'DB_ERROR');
      }

      if (!user) {
        console.error('🔐 Kullanıcı bulunamadı:', email);
        throw new AuthError('E-posta veya şifre hatalı', 'INVALID_CREDENTIALS');
      }

      // Şifre kontrolü
      if (user.password && user.password !== password) {
        console.error('🔐 Şifre yanlış');
        throw new AuthError('E-posta veya şifre hatalı', 'INVALID_CREDENTIALS');
      }

      // Danışan onaylanmamışsa giriş yapamaz
      if (user.role === 'CLIENT' && !user.approved) {
        throw new AuthError('Hesabınız henüz onaylanmamış. Lütfen onay için bekleyin.', 'NOT_APPROVED');
      }

      // LocalStorage'a kaydet
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      console.log('🔐 Giriş başarılı:', userWithoutPassword.email, 'Rol:', userWithoutPassword.role);
      return userWithoutPassword as User;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('🔐 Giriş hatası:', error);
      throw new AuthError('Giriş yapılırken bir hata oluştu');
    }
  },

  async signUp(email: string, password: string, name: string, phone?: string): Promise<User> {
    try {
      // Users tablosuna kullanıcı bilgilerini ekle
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password,
            name,
            phone,
            role: 'CLIENT',
            approved: false,
            registered_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          throw new AuthError('Bu e-posta adresi zaten kayıtlı', 'DUPLICATE_EMAIL');
        }
        throw new AuthError('Kayıt sırasında bir hata oluştu: ' + error.message, 'SIGNUP_FAILED');
      }

      // Konsola bildirim
      console.log('🔔 Yeni Danışan Kaydı:', {
        name,
        email,
        phone,
        time: new Date().toLocaleString('tr-TR')
      });

      const { password: _, ...userWithoutPassword } = data;
      return userWithoutPassword as User;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Kayıt işlemi sırasında bir hata oluştu');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // localStorage'dan kontrol et
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('🔐 Kullanıcı localStorage\'dan alındı:', user.email);
          return user as User;
        } catch (e) {
          localStorage.removeItem('currentUser');
        }
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async signOut(): Promise<void> {
    try {
      localStorage.removeItem('currentUser');
      // Supabase auth'u da temizle (varsa)
      await supabase.auth.signOut().catch(() => {});
      console.log('🔐 Çıkış yapıldı');
    } catch (error) {
      console.error('Signout error:', error);
      localStorage.removeItem('currentUser');
    }
  },

  async checkAuth(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError('Oturum bulunamadı. Lütfen giriş yapın.', 'UNAUTHORIZED');
    }
    return user;
  },

  async checkAdminAuth(): Promise<User> {
    const user = await this.checkAuth();
    if (user.role !== 'ADMIN') {
      throw new AuthError('Bu işlem için yetkiniz yok', 'FORBIDDEN');
    }
    return user;
  }
};
