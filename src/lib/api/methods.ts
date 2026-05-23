import { supabase, supabasePublic } from '../supabase';
import type { Method } from '../../types';
import { registerCacheClearer } from './_cache';

let methodsCache: Method[] | null = null;
registerCacheClearer(() => {
  methodsCache = null;
});

export const methodsApi = {
  async getAll() {
    if (methodsCache) return methodsCache;
    const { data, error } = await supabasePublic.from('methods').select('*');
    if (error) throw error;
    methodsCache = data || [];
    return methodsCache;
  },

  async create(method: Omit<Method, 'id'>) {
    const { data, error } = await supabase
      .from('methods')
      .insert([method])
      .select()
      .single();
    if (error) throw error;
    methodsCache = null;
    return data;
  },

  async update(id: string, updates: Partial<Method>) {
    const { data, error } = await supabase
      .from('methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    methodsCache = null;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('methods').delete().eq('id', id);
    if (error) throw error;
    methodsCache = null;
    return true;
  },
};
