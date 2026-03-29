import { supabase, supabasePublic } from '../supabase';
import type { ServiceType } from '../../types';
import type { CreateAppointmentInput } from '../../types/api';

// In-memory cache
let servicesCache: ServiceType[] | null = null;
let appointmentsCache: any[] | null = null;

// Helper: Tıkanmaları önlemek için istek zaman aşımı (Timeout) sarmalayıcısı
const withTimeout = <T,>(action: () => Promise<T> | PromiseLike<T>, ms = 8000, msg = 'Sunucu isteği zaman aşımına uğradı'): Promise<T> => {
    return Promise.race([
        Promise.resolve(action()),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms))
    ]);
};

export const clearServicesCache = () => {
    servicesCache = null;
    appointmentsCache = null;
};

// Services API
export const servicesApi = {
    async getAll() {
        if (servicesCache) return servicesCache;
        const { data, error } = await withTimeout(() => supabasePublic
            .from('services')
            .select('*'), 8000, 'Hizmetler alınırken zaman aşımına uğradı');

        if (error) throw error;
        servicesCache = data || [];
        return servicesCache;
    },

    async create(service: Omit<ServiceType, 'id'>) {
        const { data, error } = await supabase
            .from('services')
            .insert([service])
            .select();

        if (error) throw error;
        servicesCache = null; // Invalidate cache
        return data?.[0];
    },

    async update(id: string, updates: Partial<ServiceType>) {
        const { data, error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        servicesCache = null; // Invalidate cache
        return data?.[0];
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;
        servicesCache = null; // Invalidate cache
        return true;
    }
};

// Appointments API
export const appointmentsApi = {
    async getAll() {
        if (appointmentsCache) return appointmentsCache;
        const { data, error } = await withTimeout(() => supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false }), 8000, 'Randevular alınırken zaman aşımına uğradı');

        if (error) throw error;

        // Map snake_case DB fields to camelCase for frontend
        const mappedData = (data || []).map(row => ({
            id: row.id,
            clientId: row.client_id,
            clientName: row.client_name,
            clientEmail: row.client_email,
            clientPhone: row.client_phone,
            date: row.date,
            time: row.time,
            serviceType: row.service_type,
            serviceTitle: row.service_title,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at
        }));
        appointmentsCache = mappedData;
        return mappedData;
    },

    async getByEmail(email: string) {
        const { data, error } = await withTimeout(() => supabase
            .from('appointments')
            .select('*')
            .eq('client_email', email)
            .order('created_at', { ascending: false }), 8000, 'Kullanıcı randevuları alınamadı');

        if (error) throw error;

        // Map snake_case DB fields to camelCase for frontend
        return (data || []).map(row => ({
            id: row.id,
            clientId: row.client_id,
            clientName: row.client_name,
            clientEmail: row.client_email,
            clientPhone: row.client_phone,
            date: row.date,
            time: row.time,
            serviceType: row.service_type,
            serviceTitle: row.service_title,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at
        }));
    },

    async create(appointment: CreateAppointmentInput) {
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                client_id: appointment.clientId || null,
                client_name: appointment.clientName,
                client_email: appointment.clientEmail,
                client_phone: appointment.clientPhone || null,
                date: appointment.date,
                time: appointment.time,
                service_type: appointment.serviceType,
                service_title: appointment.serviceTitle,
                notes: appointment.notes || null,
                status: appointment.status || 'PENDING'
            }])
            .select();

        if (error) throw error;
        appointmentsCache = null; // Invalidate cache
        return data?.[0];
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        appointmentsCache = null; // Invalidate cache
        return data?.[0];
    },

    async update(id: string, updates: any) {
        const dbUpdates: any = {
            client_id: updates.clientId,
            client_name: updates.clientName,
            client_email: updates.clientEmail,
            client_phone: updates.clientPhone,
            date: updates.date,
            time: updates.time,
            service_type: updates.serviceType,
            service_title: updates.serviceTitle,
            notes: updates.notes,
            status: updates.status
        };

        Object.keys(dbUpdates).forEach(k => dbUpdates[k] === undefined && delete dbUpdates[k]);

        const { data, error } = await supabase
            .from('appointments')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        appointmentsCache = null; // Invalidate cache
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        appointmentsCache = null; // Invalidate cache
        return true;
    }
};
