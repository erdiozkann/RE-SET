import { supabase } from '../supabase';
import type { CreateReviewInput } from '../../types/api';

// Reviews are not cached: they're admin-curated (toggleApproval mutates often)
// and the public list is small; the round-trip is fine.

export const reviewsApi = {
  async getAll(adminView = false) {
    let query = supabase.from('reviews').select('*');
    if (!adminView) {
      query = query.eq('approved', true);
    }
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(review: CreateReviewInput) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleApproval(id: string) {
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('approved')
      .eq('id', id)
      .single();
    if (fetchError || !review) throw new Error('Review not found');

    const { data, error } = await supabase
      .from('reviews')
      .update({ approved: !review.approved })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};
