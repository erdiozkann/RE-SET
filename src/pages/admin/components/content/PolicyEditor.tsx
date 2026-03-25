import { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { contentApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../../lib/errors';

type PolicyType = 'kvkk' | 'privacy' | 'cookies';

interface PolicyEditorProps {
    type: PolicyType;
    title: string;
    description?: string;
    placeholder?: string;
}

export default function PolicyEditor({ type, title, description, placeholder }: PolicyEditorProps) {
    const toast = useToast();
    const [content, setContent] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            let data;
            if (type === 'kvkk') data = await contentApi.getKvkkContent();
            else if (type === 'privacy') data = await contentApi.getPrivacyContent();
            else if (type === 'cookies') data = await contentApi.getCookiesContent();

            if (data) setContent(data.content);
        } catch (error) {
            console.error(`${title} yüklenirken hata:`, error);
            toast.error(`${title} yüklenemedi`);
        } finally {
            setLoading(false);
        }
    }, [type, title, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (type === 'kvkk') await contentApi.updateKvkkContent(content);
            else if (type === 'privacy') await contentApi.updatePrivacyContent(content);
            else if (type === 'cookies') await contentApi.updateCookiesContent(content);

            toast.success(`${title} başarıyla güncellendi`);
            setEditing(false);
        } catch (error) {
            const message = getUserFriendlyErrorMessage(error);
            toast.error(`${title} kaydedilemedi: ${message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-[#1A1A1A]">{title}</h3>
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors cursor-pointer"
                    >
                        <i className="ri-pencil-line mr-2"></i>
                        Düzenle
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            İçerik (HTML destekli)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-mono text-sm"
                            placeholder={placeholder}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setEditing(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {content ? (
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                        />
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            Henüz içerik eklenmemiş. "Düzenle" butonuna tıklayarak ekleyebilirsiniz.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
