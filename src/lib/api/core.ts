import { supabase } from '../supabase';
import { handleSupabaseError, ApiError } from '../errors';

// Helper function for query execution
export const executeQuery = async <T>(
    queryPromise: Promise<{ data: T | null; error: any }> | any,
    errorMsg?: string
): Promise<T> => {
    const resolved = queryPromise.then ? await queryPromise : queryPromise;
    const { data, error } = resolved;
    if (error) {
        console.error('Supabase error:', error);
        handleSupabaseError(error);
    }
    if (!data) {
        throw new ApiError(errorMsg || 'Veri bulunamadı', 'NO_DATA', 404);
    }
    return data;
};

// Storage API - Dosya yükleme işlemleri
export const storageApi = {
    async uploadFile(
        bucket: string,
        file: File,
        folder: string = ''
    ): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw new ApiError(`Dosya yüklenemedi: ${error.message}`, 'UPLOAD_FAILED', 500);
        }

        // Public URL oluştur
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    },

    async deleteFile(bucket: string, path: string): Promise<boolean> {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) {
            console.error('Delete error:', error);
            return false;
        }
        return true;
    }
};
