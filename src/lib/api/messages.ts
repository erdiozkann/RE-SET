import { supabase } from '../supabase';
import type { ContactMessage } from '../../types';
import type { CreateContactMessageInput } from '../../types/api';

// Messages aren't cached — admins read them in real time and submissions
// must always hit the server (no stale dedupe).

export const messagesApi = {
  async getAll(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(message: CreateContactMessageInput): Promise<ContactMessage> {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: message.name,
          email: message.email,
          phone: message.phone || null,
          subject: message.subject || 'İletişim Formu',
          message: message.message,
          date: new Date().toISOString().split('T')[0],
          read: false,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markRead(id: string): Promise<ContactMessage> {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};
