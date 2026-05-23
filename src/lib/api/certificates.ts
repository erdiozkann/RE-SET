import { supabase, supabasePublic } from '../supabase';
import type { Certificate } from '../../types';
import { registerCacheClearer } from './_cache';

let certificatesCache: Certificate[] | null = null;
registerCacheClearer(() => {
  certificatesCache = null;
});

export const certificatesApi = {
  async getAll() {
    if (certificatesCache) return certificatesCache;
    const { data, error } = await supabasePublic.from('certificates').select('*');
    if (error) throw error;
    certificatesCache = data || [];
    return certificatesCache;
  },

  async create(cert: Omit<Certificate, 'id'>) {
    const { data, error } = await supabase
      .from('certificates')
      .insert([cert])
      .select()
      .single();
    if (error) throw error;
    certificatesCache = null;
    return data;
  },

  async update(id: string, updates: Partial<Certificate>) {
    const { data, error } = await supabase
      .from('certificates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    certificatesCache = null;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) throw error;
    certificatesCache = null;
    return true;
  },
};
