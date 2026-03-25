import { supabase } from '../supabase';
import type { WorkingConfig } from '../../types';

// Config API
export const configApi = {
    async get() {
        const { data, error } = await supabase
            .from('working_config')
            .select('*')
            .single();

        if (error) throw error;
        return {
            startHour: data.start_hour,
            endHour: data.end_hour,
            slotDuration: data.slot_duration,
            offDays: data.off_days
        };
    },

    async update(config: WorkingConfig) {
        const { data, error } = await supabase
            .from('working_config')
            .update({
                start_hour: config.startHour,
                end_hour: config.endHour,
                slot_duration: config.slotDuration,
                off_days: config.offDays
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
