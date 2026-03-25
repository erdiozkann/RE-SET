import { supabase } from '../supabase';
import type { Client, ProgressRecord, ProgressMetric } from '../../types';
import type { CreateProgressRecordInput, CreateProgressMetricInput, CreateClientResourceInput } from '../../types/api';

// Helper functions for progress
const clampProgressValue = (value: number | null | undefined): number => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value as number)));
};

const mapProgressRecord = (row: any): ProgressRecord => {
    // JSONB metrics varsa onu kullan, yoksa eski kolonlardan oluştur
    let metrics: Record<string, number> = {};

    if (row.metrics && typeof row.metrics === 'object') {
        // JSONB'den metrikleri al
        metrics = row.metrics;
    } else {
        // Geriye dönük uyumluluk: eski kolonlardan metrics oluştur
        metrics = {
            emotional_clarity: clampProgressValue(row.emotional_clarity),
            mental_clarity: clampProgressValue(row.mental_clarity),
            centeredness: clampProgressValue(row.centeredness)
        };
    }

    return {
        id: row.id,
        clientId: row.client_id,
        sessionDate: row.session_date,
        metrics,
        summary: row.summary || row.notes || '',
        // Geriye dönük uyumluluk
        emotionalClarity: clampProgressValue(row.emotional_clarity || metrics.emotional_clarity),
        mentalClarity: clampProgressValue(row.mental_clarity || metrics.mental_clarity),
        centeredness: clampProgressValue(row.centeredness || metrics.centeredness)
    };
};

// In-memory cache
let clientsCache: Client[] | null = null;
let progressMetricsCache: ProgressMetric[] | null = null;

export const clearClientsCache = () => {
    clientsCache = null;
    progressMetricsCache = null;
};

// Helper: Tıkanmaları önlemek için istek zaman aşımı (Timeout) sarmalayıcısı
const withTimeout = <T,>(action: () => Promise<T> | PromiseLike<T>, ms = 8000, msg = 'Sunucu isteği zaman aşımına uğradı'): Promise<T> => {
    return Promise.race([
        Promise.resolve(action()),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms))
    ]);
};

// Clients API
export const clientsApi = {
    async getAll() {
        if (clientsCache) return clientsCache;
        const { data, error } = await withTimeout(() => supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false }), 8000);

        if (error) throw error;

        // Bakiye alanları veritabanında zaten var (trigger veya manual update ile)
        // Sadece null check yapıyoruz
        const mappedData = (data || []).map(client => ({
            ...client,
            name: client.name || client.full_name,
            fullName: client.full_name || client.name,
            totalDebt: client.total_debt || 0,
            totalPaid: client.total_paid || 0,
            balance: (client.total_debt || 0) - (client.total_paid || 0),
            isActive: client.is_active !== false,
            createdAt: client.created_at
        }));
        clientsCache = mappedData;
        return mappedData;
    },

    async getByEmail(email: string) {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data;
    },

    async create(client: { name: string; email: string; phone?: string; notes?: string }) {
        // Supabase için snake_case dönüşümü
        const clientData = {
            name: client.name,
            email: client.email,
            phone: client.phone || null,
            notes: client.notes || null
        };

        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) throw error;
        clientsCache = null; // Invalidate cache
        return data;
    },

    async update(id: string, updates: Partial<Client>) {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        clientsCache = null; // Invalidate cache
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw error;
        clientsCache = null; // Invalidate cache
    }
};

// Progress Metrics API
export const progressMetricsApi = {
    async getAll(): Promise<ProgressMetric[]> {
        if (progressMetricsCache) return progressMetricsCache;
        const { data, error } = await supabase
            .from('progress_metrics')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) throw error;
        const mappedData = (data || []).map((row: any) => ({
            id: row.id,
            key: row.key,
            label: row.label,
            description: row.description,
            icon: row.icon,
            color: row.color,
            orderIndex: row.order_index,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        progressMetricsCache = mappedData;
        return mappedData;
    },

    async create(metric: CreateProgressMetricInput): Promise<ProgressMetric> {
        const { data, error } = await supabase
            .from('progress_metrics')
            .insert([{
                key: metric.key,
                label: metric.label,
                description: metric.description,
                icon: metric.icon,
                color: metric.color || 'blue',
                order_index: metric.orderIndex,
                is_active: metric.isActive ?? true
            }])
            .select()
            .single();

        if (error) throw error;

        const result = {
            id: data.id,
            key: data.key,
            label: data.label,
            description: data.description,
            icon: data.icon,
            color: data.color,
            orderIndex: data.order_index,
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
        progressMetricsCache = null; // Invalidate cache
        return result;
    },

    async update(id: string, updates: Partial<CreateProgressMetricInput>): Promise<ProgressMetric> {
        const payload: any = {};

        if (updates.label !== undefined) payload.label = updates.label;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.icon !== undefined) payload.icon = updates.icon;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        const { data, error } = await supabase
            .from('progress_metrics')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const result = {
            id: data.id,
            key: data.key,
            label: data.label,
            description: data.description,
            icon: data.icon,
            color: data.color,
            orderIndex: data.order_index,
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
        progressMetricsCache = null; // Invalidate cache
        return result;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('progress_metrics')
            .delete()
            .eq('id', id);

        if (error) throw error;
        progressMetricsCache = null; // Invalidate cache
        return true;
    }
};

export const progressApi = {
    async getByClient(clientId: string): Promise<ProgressRecord[]> {
        const { data, error } = await supabase
            .from('progress_records')
            .select('*')
            .eq('client_id', clientId)
            .order('session_date', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapProgressRecord);
    },

    async create(record: CreateProgressRecordInput): Promise<ProgressRecord> {
        const payload: any = {
            client_id: record.clientId,
            session_date: record.sessionDate,
            metrics: record.metrics || {},
            summary: record.summary || null
        };

        // Geriye dönük uyumluluk: eski kolonları da doldur
        if (record.metrics) {
            payload.emotional_clarity = record.metrics.emotional_clarity || record.metrics.clarity || 0;
            payload.mental_clarity = record.metrics.mental_clarity || record.metrics.awareness || 0;
            payload.centeredness = record.metrics.centeredness || record.metrics.balance || 0;
        }

        const { data, error } = await supabase
            .from('progress_records')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return mapProgressRecord(data);
    },

    async update(id: string, record: Partial<CreateProgressRecordInput>): Promise<ProgressRecord> {
        const payload: any = {};

        if (record.sessionDate !== undefined) payload.session_date = record.sessionDate;
        if (record.metrics !== undefined) payload.metrics = record.metrics;
        if (record.summary !== undefined) payload.summary = record.summary || null;

        // Geriye dönük uyumluluk
        if (record.metrics) {
            payload.emotional_clarity = record.metrics.emotional_clarity || record.metrics.clarity || 0;
            payload.mental_clarity = record.metrics.mental_clarity || record.metrics.awareness || 0;
            payload.centeredness = record.metrics.centeredness || record.metrics.balance || 0;
        }

        const { data, error } = await supabase
            .from('progress_records')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapProgressRecord(data);
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('progress_records')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// Resources API
export const resourcesApi = {
    async getByClient(clientId: string) {
        const { data, error } = await supabase
            .from('client_resources')
            .select('*')
            .eq('client_id', clientId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(resource: CreateClientResourceInput) {
        const { data, error } = await supabase
            .from('client_resources')
            .insert([{
                client_id: resource.clientId,
                type: resource.type,
                title: resource.title,
                description: resource.description,
                url: resource.url,
                date: resource.date
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('client_resources')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
