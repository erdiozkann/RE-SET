import { supabase } from '../supabase';
import type { CreateAdAccountInput, UpdateAdAccountInput } from '../../types/api';

// Ads Tracking APIs
export const adAccountsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('ad_accounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('ad_accounts sorgusu:', error);
            return [];
        }
        return data || [];
    },

    async create(account: CreateAdAccountInput) {
        const { data, error } = await supabase
            .from('ad_accounts')
            .insert([{
                account_name: account.name,
                platform: account.platform,
                account_id: account.account_id,
                status: account.status ?? 'ACTIVE',
                currency: account.currency
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: UpdateAdAccountInput) {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.account_name = updates.name;
        if (updates.platform) dbUpdates.platform = updates.platform;
        if (updates.account_id) dbUpdates.account_id = updates.account_id;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.currency) dbUpdates.currency = updates.currency;

        const { data, error } = await supabase
            .from('ad_accounts')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('ad_accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

export const adCampaignsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('ad_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('ad_campaigns sorgusu:', error);
            return [];
        }
        return data || [];
    },

    async getByAccount(accountId: string) {
        const { data, error } = await supabase
            .from('ad_campaigns')
            .select('*')
            .eq('account_id', accountId);

        if (error) return [];
        return data || [];
    }
};

export const adMetricsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('ad_metrics')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.warn('ad_metrics sorgusu:', error);
            return [];
        }
        return data || [];
    }
};

export const adConversionsApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('ad_conversions')
            .select('*')
            .order('conversion_date', { ascending: false });

        if (error) {
            console.warn('ad_conversions sorgusu:', error);
            return [];
        }
        return data || [];
    }
};

export const adROISummaryApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('ad_roi_summary')
            .select('*');

        if (error) {
            console.warn('ad_roi_summary sorgusu:', error);
            return [];
        }
        return data || [];
    }
};
