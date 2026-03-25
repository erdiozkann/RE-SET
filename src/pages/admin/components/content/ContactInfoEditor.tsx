import { useState, useEffect, useRef, useCallback } from 'react';
import { contentApi, storageApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../../lib/errors';
import type { ContactInfo } from '../../../../types';

export default function ContactInfoEditor() {
    const toast = useToast();
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [editingContact, setEditingContact] = useState(false);
    const [contactForm, setContactForm] = useState({
        email: '',
        phone: '',
        address: '',
        instagram: '',
        youtube: '',
        logo_url: ''
    });
    const [logoUploadMethod, setLogoUploadMethod] = useState<'url' | 'file'>('url');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const loadContact = useCallback(async () => {
        try {
            const contactData = await contentApi.getContactInfo();
            setContactInfo(contactData);
            setContactForm({
                email: contactData.email,
                phone: contactData.phone,
                address: contactData.address,
                instagram: contactData.instagram || '',
                youtube: contactData.youtube || '',
                logo_url: contactData.logo_url || ''
            });
        } catch (error) {
            console.error('Contact info loading error:', error);
            toast.error('İletişim bilgileri yüklenemedi');
        }
    }, [toast]);

    useEffect(() => {
        loadContact();
    }, [loadContact]);

    const handleEditContact = () => {
        setEditingContact(true);
    };

    const handleContactSave = async () => {
        if (!contactForm.email || !contactForm.phone || !contactForm.address) {
            toast.error('Lütfen zorunlu alanları doldurun');
            return;
        }

        try {
            await contentApi.updateContactInfo({
                email: contactForm.email,
                phone: contactForm.phone,
                address: contactForm.address,
                instagram: contactForm.instagram,
                youtube: contactForm.youtube,
                logo_url: contactForm.logo_url
            });

            await loadContact();
            setEditingContact(false);
            toast.success('İletişim bilgileri başarıyla güncellendi');
        } catch (error) {
            const message = getUserFriendlyErrorMessage(error);
            toast.error(`İletişim bilgileri kaydedilirken hata: ${message}`);
        }
    };

    const handleContactCancel = () => {
        if (contactInfo) {
            setContactForm({
                email: contactInfo.email,
                phone: contactInfo.phone,
                address: contactInfo.address,
                instagram: contactInfo.instagram || '',
                youtube: contactInfo.youtube || '',
                logo_url: contactInfo.logo_url || ''
            });
        }
        setEditingContact(false);
        setLogoUploadMethod('url');
    };

    const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Logo dosyası 2MB\'dan küçük olmalıdır');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Lütfen geçerli bir resim dosyası seçin');
            return;
        }

        setUploadingLogo(true);
        try {
            const url = await storageApi.uploadFile('logos', file);
            setContactForm({ ...contactForm, logo_url: url });
            toast.success('Logo yüklendi');
        } catch {
            toast.error('Logo yüklenemedi. Supabase Storage kontrol edin.');
            // Fallback: Base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setContactForm({ ...contactForm, logo_url: result });
            };
            reader.readAsDataURL(file);
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">İletişim Bilgileri</h3>

            {contactInfo && (
                <div className="border border-gray-200 rounded-lg p-4">
                    {/* Site Logosu */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h4 className="font-semibold text-[#1A1A1A] mb-3">Site Logosu:</h4>
                        {contactInfo.logo_url ? (
                            <img
                                src={contactInfo.logo_url}
                                alt="Site Logo"
                                className="h-16 w-auto object-contain bg-gray-50 p-2 rounded-lg"
                            />
                        ) : (
                            <p className="text-gray-500 italic">Logo yüklenmemiş</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h4 className="font-semibold text-[#1A1A1A] mb-2">E-posta:</h4>
                            <p className="text-gray-700">{contactInfo.email}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1A1A1A] mb-2">Telefon:</h4>
                            <p className="text-gray-700">{contactInfo.phone}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1A1A1A] mb-2">Adres:</h4>
                            <p className="text-gray-700">{contactInfo.address}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1A1A1A] mb-2">Instagram:</h4>
                            <p className="text-gray-700">{contactInfo.instagram || 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1A1A1A] mb-2">YouTube:</h4>
                            <p className="text-gray-700">{contactInfo.youtube || 'Belirtilmemiş'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleEditContact}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                    >
                        <i className="ri-edit-line mr-2"></i>
                        Düzenle
                    </button>
                </div>
            )}

            {/* İletişim Bilgileri Düzenleme Modal */}
            {editingContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                            İletişim Bilgilerini Düzenle
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-posta *
                                </label>
                                <input
                                    type="email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="info@re-set.com.tr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon *
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="+90 532 123 45 67"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adres *
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.address}
                                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="Nişantaşı, İstanbul"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instagram
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.instagram}
                                    onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="https://instagram.com/kullaniciadi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    YouTube
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.youtube}
                                    onChange={(e) => setContactForm({ ...contactForm, youtube: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="https://youtube.com/@kullaniciadi"
                                />
                            </div>

                            {/* Logo Yükleme Alanı */}
                            <div className="pt-4 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Site Logosu
                                </label>

                                {/* Yükleme Yöntemi Seçimi */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setLogoUploadMethod('url')}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${logoUploadMethod === 'url'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-link mr-2"></i>
                                        URL ile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogoUploadMethod('file')}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${logoUploadMethod === 'file'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-upload-2-line mr-2"></i>
                                        Dosya Yükle
                                    </button>
                                </div>

                                {/* URL Girişi */}
                                {logoUploadMethod === 'url' && (
                                    <input
                                        type="text"
                                        value={contactForm.logo_url}
                                        onChange={(e) => setContactForm({ ...contactForm, logo_url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                        placeholder="https://example.com/logo.png"
                                    />
                                )}

                                {/* Dosya Yükleme */}
                                {logoUploadMethod === 'file' && (
                                    <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                            onChange={handleLogoFileUpload}
                                            className="hidden"
                                            disabled={uploadingLogo}
                                        />
                                        {uploadingLogo ? (
                                            <>
                                                <i className="ri-loader-4-line text-3xl text-[#D4AF37] mb-2 animate-spin"></i>
                                                <p className="text-sm text-gray-600">Yükleniyor...</p>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-image-add-line text-3xl text-gray-400 mb-2"></i>
                                                <p className="text-sm text-gray-600">Logo seçmek için tıklayın</p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, SVG veya JPEG - Max 2MB</p>
                                            </>
                                        )}
                                    </label>
                                )}

                                <p className="mt-2 text-xs text-gray-500">Navbar'da görünecek site logosu.</p>

                                {/* Önizleme */}
                                {contactForm.logo_url && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                                        <img
                                            src={contactForm.logo_url}
                                            alt="Logo önizleme"
                                            className="h-12 w-auto object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setContactForm({ ...contactForm, logo_url: '' })}
                                            className="mt-2 text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                        >
                                            <i className="ri-delete-bin-line mr-1"></i>
                                            Logoyu Kaldır
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleContactCancel}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleContactSave}
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
