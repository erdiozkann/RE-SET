import { useState, useEffect, useRef, useCallback } from 'react';
import { contentApi, storageApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../../lib/errors';
import type { AboutContent } from '../../../../types';

export default function AboutEditor() {
    const toast = useToast();
    const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
    const [editingAbout, setEditingAbout] = useState(false);
    const [aboutForm, setAboutForm] = useState({
        title: '',
        paragraph1: '',
        paragraph2: '',
        image: '',
        story: '',
        text_color: '#1A1A1A'
    });
    const [aboutImageUploadMethod, setAboutImageUploadMethod] = useState<'url' | 'file'>('url');
    const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
    const aboutImageInputRef = useRef<HTMLInputElement>(null);

    const loadAbout = useCallback(async () => {
        try {
            const aboutData = await contentApi.getAboutContents();
            if (aboutData.length > 0) {
                setAboutContent(aboutData[0]);
                setAboutForm({
                    title: aboutData[0].title,
                    paragraph1: aboutData[0].paragraph1,
                    paragraph2: aboutData[0].paragraph2,
                    image: aboutData[0].image || '',
                    story: aboutData[0].story || `Hayatımın büyük bir bölümünde, başkalarının beklentilerini karşılamaya odaklanmış, kendi iç sesimi duymakta zorlandığım bir dönem yaşadım. Kurumsal dünyada geçirdiğim yıllar boyunca başarılı görünürken, içimde derin bir boşluk hissediyordum.

Bu iç yolculuk, beni Demartini Metodu ve değer belirleme dünyasıyla tanıştırdı. Önce kendi hayatımı dönüştürdüm, sonra bu dönüşümün gücünü başkalarıyla paylaşma arzusu doğdu. Dr. John Demartini'den aldığım uluslararası sertifikalarımla ve sürekli eğitimlerle kendimi geliştirdim ve bugün buradayım.

Artık biliyorum ki, gerçek değişim içeriden başlar. Her bireyin kendine özgü bir potansiyeli vardır ve bu potansiyeli ortaya çıkarmak için sadece doğru rehberliğe ve içsel farkındalığa ihtiyaç vardır.`,
                    text_color: aboutData[0].text_color || '#1A1A1A'
                });
            }
        } catch (error) {
            console.error('About loading error:', error);
            toast.error('Hakkımda içeriği yüklenemedi');
        }
    }, [toast]);

    useEffect(() => {
        loadAbout();
    }, [loadAbout]);

    const handleEditAbout = () => {
        setEditingAbout(true);
    };

    const handleAboutSave = async () => {
        try {
            if (aboutContent) {
                await contentApi.updateAboutContent(aboutContent.id, {
                    ...aboutForm,
                    image: aboutForm.image
                });
                await loadAbout();
                setEditingAbout(false);
                toast.success('Hakkımda içeriği başarıyla güncellendi');
            }
        } catch (error) {
            const message = getUserFriendlyErrorMessage(error);
            toast.error(`Hakkımda içeriği kaydedilirken hata: ${message}`);
        }
    };

    const handleAboutCancel = () => {
        if (aboutContent) {
            setAboutForm({
                title: aboutContent.title,
                paragraph1: aboutContent.paragraph1,
                paragraph2: aboutContent.paragraph2,
                image: aboutContent.image || '',
                story: aboutContent.story || '',
                text_color: aboutContent.text_color || '#1A1A1A'
            });
        }
        setEditingAbout(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Ana Sayfa Hakkımda Bölümü</h3>

            {aboutContent && (
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Mevcut Resim Önizleme */}
                        {aboutContent.image && (
                            <div className="w-32 h-32 flex-shrink-0">
                                <img
                                    src={aboutContent.image}
                                    alt="Hakkımda Resmi"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-4">
                                <h4 className="font-semibold text-[#1A1A1A] mb-2">Başlık:</h4>
                                <p className="text-gray-700">{aboutContent.title}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-[#1A1A1A] mb-2">Birinci Paragraf:</h4>
                                <p className="text-gray-700">{aboutContent.paragraph1}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-[#1A1A1A] mb-2">İkinci Paragraf:</h4>
                                <p className="text-gray-700">{aboutContent.paragraph2}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleEditAbout}
                                className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                            >
                                <i className="ri-edit-line mr-2"></i>
                                Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hakkımda İçerik Düzenleme Modal */}
            {editingAbout && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                            Hakkımda Bölümünü Düzenle
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık
                                </label>
                                <input
                                    type="text"
                                    value={aboutForm.title}
                                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="Şafak Özkan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık Rengi
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={aboutForm.text_color}
                                        onChange={(e) => setAboutForm({ ...aboutForm, text_color: e.target.value })}
                                        className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        value={aboutForm.text_color}
                                        onChange={(e) => setAboutForm({ ...aboutForm, text_color: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent uppercase"
                                        placeholder="#1A1A1A"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Birinci Paragraf
                                </label>
                                <textarea
                                    value={aboutForm.paragraph1}
                                    onChange={(e) => setAboutForm({ ...aboutForm, paragraph1: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                                    placeholder="15 yılı aşkın deneyimimle..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    İkinci Paragraf
                                </label>
                                <textarea
                                    value={aboutForm.paragraph2}
                                    onChange={(e) => setAboutForm({ ...aboutForm, paragraph2: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                                    placeholder="Amacım, sizin içsel gücünüzü..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hikayem (Tam Metin)
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Buraya yazılan metin "Hikayem" başlığı altında görünecektir. Paragraflar arası boşluk bırakabilirsiniz.
                                </p>
                                <textarea
                                    value={aboutForm.story}
                                    onChange={(e) => setAboutForm({ ...aboutForm, story: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                    placeholder="Hayatımın büyük bir bölümünde..."
                                />
                            </div>

                            {/* About Resim Yükleme */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profil Görseli
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setAboutImageUploadMethod('url')}
                                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${aboutImageUploadMethod === 'url'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-link mr-1"></i> URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAboutImageUploadMethod('file')}
                                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${aboutImageUploadMethod === 'file'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-upload-2-line mr-1"></i> Dosya
                                    </button>
                                </div>

                                {aboutImageUploadMethod === 'url' ? (
                                    <input
                                        type="text"
                                        value={aboutForm.image}
                                        onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                        placeholder="Resim URL'si girin"
                                    />
                                ) : (
                                    <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                                        <input
                                            ref={aboutImageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error('Dosya 5MB\'dan küçük olmalı');
                                                    return;
                                                }
                                                setUploadingAboutImage(true);
                                                try {
                                                    const url = await storageApi.uploadFile('profile-images', file);
                                                    setAboutForm({ ...aboutForm, image: url });
                                                    toast.success('Görsel yüklendi');
                                                } catch {
                                                    toast.error('Görsel yüklenemedi');
                                                } finally {
                                                    setUploadingAboutImage(false);
                                                }
                                            }}
                                            className="hidden"
                                            disabled={uploadingAboutImage}
                                        />
                                        {uploadingAboutImage ? (
                                            <i className="ri-loader-4-line text-3xl text-[#D4AF37] animate-spin"></i>
                                        ) : (
                                            <>
                                                <i className="ri-image-add-line text-3xl text-gray-400"></i>
                                                <p className="text-sm text-gray-600 mt-1">Resim seçin (max 5MB)</p>
                                            </>
                                        )}
                                    </label>
                                )}

                                {aboutForm.image && (
                                    <div className="mt-3 relative">
                                        <img
                                            src={aboutForm.image}
                                            alt="Profil önizleme"
                                            className="w-full h-40 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Geçersiz+Resim';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setAboutForm({ ...aboutForm, image: '' })}
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
                                onClick={handleAboutCancel}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAboutSave}
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
