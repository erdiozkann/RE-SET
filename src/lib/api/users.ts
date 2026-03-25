import { supabase } from '../supabase';
import type { User } from '../../types';

// Helper: Tıkanmaları önlemek için istek zaman aşımı (Timeout) sarmalayıcısı
const withTimeout = <T,>(action: () => Promise<T> | PromiseLike<T>, ms = 8000, msg = 'Sunucu isteği zaman aşımına uğradı'): Promise<T> => {
    return Promise.race([
        Promise.resolve(action()),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms))
    ]);
};

// Users API
export const usersApi = {
    async getAll() {
        const { data, error } = await withTimeout(() => supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false }), 8000);

        if (error) throw error;
        return (data || []).map(({ password, ...user }) => user);
    },

    async getPending() {
        const { data, error } = await withTimeout(() => supabase
            .from('users')
            .select('*')
            .eq('role', 'CLIENT')
            .eq('approved', false)
            .order('registered_at', { ascending: false }), 8000);

        if (error) throw error;
        return (data || []).map(({ password, ...user }) => user);
    },

    async approve(email: string) {
        // 1. Önce kullanıcı verisini al
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError) throw fetchError;

        // 2. Kullanıcıyı onayla (Optimistic update)
        const { data: approvedUser, error: updateError } = await supabase
            .from('users')
            .update({ approved: true })
            .eq('email', email)
            .select()
            .single();

        if (updateError) throw updateError;

        try {
            // 3. Clients tablosunda bu email var mı kontrol et
            const { data: existingClient } = await supabase
                .from('clients')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            // 4. Eğer clients tablosunda yoksa ekle
            if (!existingClient) {
                const { error: clientError } = await supabase
                    .from('clients')
                    .insert([{
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone || null,
                        is_active: true
                    }]);

                if (clientError) {
                    throw clientError; // Catch bloğuna gitmesi için fırlat
                }
            }

            const { password, ...user } = approvedUser;
            return user;

        } catch (error) {
            console.error('Client oluşturma başarısız, rollback yapılıyor...', error);

            // 🚨 ROLLBACK: Kullanıcı onayını geri al
            await supabase
                .from('users')
                .update({ approved: false })
                .eq('email', email);

            throw new Error('Kullanıcı onaylandı ancak müşteri kaydı oluşturulamadığı için işlem geri alındı. Lütfen tekrar deneyin.');
        }
    },

    async reject(email: string) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('email', email);

        if (error) throw error;
        return true;
    },

    async update(email: string, updates: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('email', email)
            .select()
            .single();

        if (error) throw error;
        const { password, ...user } = data;
        return user;
    },

    async delete(email: string) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('email', email);

        if (error) throw error;
        return true;
    }
};
