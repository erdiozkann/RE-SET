import { useState, useEffect, useRef, useCallback } from 'react';
import { contentApi, storageApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../../lib/errors';
import type { HeroContent } from '../../../../types';

export default function HeroEditor() {
    const toast = useToast();
    const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
    const [editingHero, setEditingHero] = useState(false);
    const [heroForm, setHeroForm] = useState({
        title: '',
        description: '',
        titleSize: 'text-5xl md:text-6xl',
        descriptionSize: 'text-xl',
        image: '',
        text_color: '#1A1A1A'
    });
    const [heroImageUploadMethod, setHeroImageUploadMethod] = useState<'url' | 'file'>('url');
    const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
    const heroImageInputRef = useRef<HTMLInputElement>(null);

    const loadHero = useCallback(async () => {
        try {
            const heroData = await contentApi.getHeroContents();
            if (heroData.length > 0) {
                setHeroContent(heroData[0]);
                setHeroForm({
                    title: heroData[0].title,
                    description: heroData[0].description,
                    titleSize: heroData[0].titleSize || 'text-5xl md:text-6xl',
                    descriptionSize: heroData[0].descriptionSize || 'text-xl',
                    image: heroData[0].image || '',
                    text_color: heroData[0].text_color || '#1A1A1A'
                });
            }
        } catch (error) {
            console.error('Hero content loading error:', error);
        }
    }, []);

    useEffect(() => {
        loadHero();
    }, [loadHero]);

    const handleEditHero = () => {
        if (heroContent) {
            setHeroForm({
                title: heroContent.title,
                description: heroContent.description,
                titleSize: heroContent.titleSize || 'text-5xl md:text-6xl',
                descriptionSize: heroContent.descriptionSize || 'text-xl',
                image: heroContent.image || '',
                text_color: heroContent.text_color || '#1A1A1A'
            });
        }
        setEditingHero(true);
    };

    const handleHeroSave = async () => {
        if (!heroForm.title || !heroForm.description) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            if (heroContent) {
                await contentApi.updateHeroContent(heroContent.id, {
                    title: heroForm.title,
                    description: heroForm.description,
                    image: heroForm.image,
                    text_color: heroForm.text_color,
                    titleSize: heroForm.titleSize,
                    descriptionSize: heroForm.descriptionSize
                });

                await loadHero();
                setEditingHero(false);
                toast.success('Hero içeriği başarıyla güncellendi');
            }
        } catch (error) {
            const message = getUserFriendlyErrorMessage(error);
            toast.error(`Hero içeriği kaydedilirken hata: ${message}`);
        }
    };

    const handleHeroCancel = () => {
        if (heroContent) {
            setHeroForm({
                title: heroContent.title,
                description: heroContent.description,
                titleSize: heroContent.titleSize || 'text-5xl md:text-6xl',
                descriptionSize: heroContent.descriptionSize || 'text-xl',
                image: heroContent.image || '',
                text_color: heroContent.text_color || '#1A1A1A'
            });
        }
        setEditingHero(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Ana Sayfa Hero Bölümü</h3>

            {heroContent && (
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                        <h4 className="font-semibold text-[#1A1A1A] mb-2">Başlık:</h4>
                        <p className="text-gray-700">{heroContent.title}</p>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-semibold text-[#1A1A1A] mb-2">Açıklama:</h4>
                        <p className="text-gray-700">{heroContent.description}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleEditHero}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                    >
                        <i className="ri-edit-line mr-2"></i>
                        Düzenle
                    </button>
                </div>
            )}

            {/* Hero İçerik Düzenleme Modal */}
            {editingHero && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                            Hero Bölümünü Düzenle
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık
                                </label>
                                <input
                                    type="text"
                                    value={heroForm.title}
                                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="Hayatınızı Yeniden Keşfedin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık Rengi
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={heroForm.text_color}
                                        onChange={(e) => setHeroForm({ ...heroForm, text_color: e.target.value })}
                                        className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        value={heroForm.text_color}
                                        onChange={(e) => setHeroForm({ ...heroForm, text_color: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent uppercase"
                                        placeholder="#1A1A1A"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık Boyutu
                                </label>
                                <select
                                    value={heroForm.titleSize}
                                    onChange={(e) => setHeroForm({ ...heroForm, titleSize: e.target.value })}
                                    className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                >
                                    <option value="text-3xl md:text-4xl">Küçük</option>
                                    <option value="text-4xl md:text-5xl">Orta</option>
                                    <option value="text-5xl md:text-6xl">Büyük</option>
                                    <option value="text-6xl md:text-7xl">Çok Büyük</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    value={heroForm.description}
                                    onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                                    placeholder="Demartini Metodu ile değerlerinizi keşfedin..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama Boyutu
                                </label>
                                <select
                                    value={heroForm.descriptionSize}
                                    onChange={(e) => setHeroForm({ ...heroForm, descriptionSize: e.target.value })}
                                    className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                >
                                    <option value="text-base">Küçük</option>
                                    <option value="text-lg">Orta</option>
                                    <option value="text-xl">Büyük</option>
                                    <option value="text-2xl">Çok Büyük</option>
                                </select>
                            </div>

                            {/* Hero Resim Yükleme */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hero Görseli (Opsiyonel)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setHeroImageUploadMethod('url')}
                                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${heroImageUploadMethod === 'url'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-link mr-1"></i> URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHeroImageUploadMethod('file')}
                                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${heroImageUploadMethod === 'file'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-upload-2-line mr-1"></i> Dosya
                                    </button>
                                </div>

                                {heroImageUploadMethod === 'url' ? (
                                    <input
                                        type="text"
                                        value={heroForm.image}
                                        onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                        placeholder="Resim URL'si girin"
                                    />
                                ) : (
                                    <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                                        <input
                                            ref={heroImageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('Dosya 5MB\'dan küçük olmalı');
                                                    return;
                                                }
                                                setUploadingHeroImage(true);
                                                try {
                                                    const url = await storageApi.uploadFile('profile-images', file);
                                                    setHeroForm({ ...heroForm, image: url });
                                                    toast.success('Görsel yüklendi');
                                                } catch {
                                                    toast.error('Görsel yüklenemedi');
                                                } finally {
                                                    setUploadingHeroImage(false);
                                                }
                                            }}
                                            className="hidden"
                                            disabled={uploadingHeroImage}
                                        />
                                        {uploadingHeroImage ? (
                                            <i className="ri-loader-4-line text-3xl text-[#D4AF37] animate-spin"></i>
                                        ) : (
                                            <>
                                                <i className="ri-image-add-line text-3xl text-gray-400"></i>
                                                <p className="text-sm text-gray-600 mt-1">Resim seçin (max 5MB)</p>
                                            </>
                                        )}
                                    </label>
                                )}

                                {heroForm.image && (
                                    <div className="mt-3 relative">
                                        <img
                                            src={heroForm.image}
                                            alt="Hero önizleme"
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Geçersiz+Resim';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setHeroForm({ ...heroForm, image: '' })}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleHeroCancel}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleHeroSave}
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
