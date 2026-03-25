import { useState, useEffect, useCallback } from 'react';
import { certificatesApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../../lib/errors';
import type { Certificate } from '../../../../types';

export default function CertificatesManager() {
    const toast = useToast();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [showCertModal, setShowCertModal] = useState(false);
    const [editingCert, setEditingCert] = useState<Certificate | null>(null);
    const [certForm, setCertForm] = useState({
        title: '',
        organization: '',
        year: ''
    });

    const loadCertificates = useCallback(async () => {
        try {
            const certs = await certificatesApi.getAll();
            setCertificates(certs);
        } catch (error) {
            console.error('Sertifikalar yüklenirken hata:', error);
            toast.error('Sertifikalar yüklenemedi');
        }
    }, [toast]);

    useEffect(() => {
        loadCertificates();
    }, [loadCertificates]);

    const handleAddCert = () => {
        setEditingCert(null);
        setCertForm({ title: '', organization: '', year: '' });
        setShowCertModal(true);
    };

    const handleEditCert = (cert: Certificate) => {
        setEditingCert(cert);
        setCertForm({
            title: cert.title,
            organization: cert.organization,
            year: cert.year
        });
        setShowCertModal(true);
    };

    const handleSaveCert = async () => {
        if (!certForm.title || !certForm.organization || !certForm.year) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            if (editingCert) {
                await certificatesApi.update(editingCert.id, certForm);
                toast.success('Sertifika başarıyla güncellendi');
            } else {
                await certificatesApi.create(certForm);
                toast.success('Sertifika başarıyla eklendi');
            }

            await loadCertificates();
            setShowCertModal(false);
        } catch (error) {
            const message = getUserFriendlyErrorMessage(error);
            toast.error(`Sertifika kaydedilirken hata: ${message}`);
        }
    };

    const handleDeleteCert = async (id: string) => {
        if (confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) {
            try {
                await certificatesApi.delete(id);
                await loadCertificates();
                toast.success('Sertifika başarıyla silindi');
            } catch (error) {
                const message = getUserFriendlyErrorMessage(error);
                toast.error(`Sertifika silinirken hata: ${message}`);
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Sertifikalar & Eğitimler</h3>
                <button
                    type="button"
                    onClick={handleAddCert}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                >
                    <i className="ri-add-line"></i>
                    Yeni Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1A1A1A] mb-2">{cert.title}</h4>
                        <p className="text-[#D4AF37] text-sm mb-1">{cert.organization}</p>
                        <p className="text-gray-600 text-sm mb-3">{cert.year}</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleEditCert(cert)}
                                className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm whitespace-nowrap cursor-pointer"
                            >
                                <i className="ri-edit-line mr-1"></i>
                                Düzenle
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteCert(cert.id)}
                                className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm whitespace-nowrap cursor-pointer"
                            >
                                <i className="ri-delete-bin-line mr-1"></i>
                                Sil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sertifika Modal */}
            {showCertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                            {editingCert ? 'Sertifika Düzenle' : 'Yeni Sertifika Ekle'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sertifika Adı
                                </label>
                                <input
                                    type="text"
                                    value={certForm.title}
                                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="ICF Sertifikalı Yaşam Koçu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kurum
                                </label>
                                <input
                                    type="text"
                                    value={certForm.organization}
                                    onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="International Coach Federation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Yıl
                                </label>
                                <input
                                    type="text"
                                    value={certForm.year}
                                    onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="2024"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCertModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCert}
                                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
