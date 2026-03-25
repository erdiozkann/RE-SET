import { useState, useEffect, useRef, useCallback } from 'react';
import { contentApi, storageApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../../lib/errors';
import type { ProfileImage } from '../../../../types';

export default function ProfileImagesManager() {
    const toast = useToast();
    const [profileImages, setProfileImages] = useState<ProfileImage[]>([]);
    const [editingImage, setEditingImage] = useState<ProfileImage | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadImages = useCallback(async () => {
        try {
            const images = await contentApi.getProfileImages();
            setProfileImages(images);
        } catch (error) {
            console.error('Profil resimleri yüklenirken hata:', error);
            toast.error('Profil resimleri yüklenemedi');
        }
    }, [toast]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const handleEditImage = (image: ProfileImage) => {
        setEditingImage(image);
        setImageUrl(image.url);
        setUploadMethod('url');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Lütfen geçerli bir resim dosyası seçin');
            return;
        }

        setUploadingImage(true);
        try {
            const url = await storageApi.uploadFile('profile-images', file);
            setImageUrl(url);
            toast.success('Görsel yüklendi');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Görsel yüklenemedi. Supabase Storage bucket kontrol edin.');
            // Fallback: Base64 kullan
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setImageUrl(result);
            };
            reader.readAsDataURL(file);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveImage = async () => {
        if (!imageUrl || !editingImage) return;

        try {
            await contentApi.updateProfileImage(editingImage.id, imageUrl);
            await loadImages();
            setEditingImage(null);
            setImageUrl('');
            setUploadMethod('url');
            toast.success('Resim başarıyla güncellendi');
        } catch (error) {
            const message = getUserFriendlyErrorMessage(error);
            toast.error(`Resim kaydedilirken hata: ${message}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Profil Resimleri</h3>

            <div className="space-y-4">
                {profileImages.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-32 h-32 flex-shrink-0">
                                <img
                                    src={image.url}
                                    alt={image.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-[#1A1A1A] mb-2">{image.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Konum: {
                                        image.location === 'about-hero' ? 'Hakkımda Sayfası' :
                                            image.location === 'home-about' ? 'Ana Sayfa - Hakkımda Bölümü' :
                                                'Diğer'
                                    }
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleEditImage(image)}
                                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    <i className="ri-edit-line mr-2"></i>
                                    Resmi Değiştir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resim Düzenleme Modal */}
            {editingImage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                            Resmi Değiştir
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    {editingImage.name}
                                </label>

                                {/* Yükleme Yöntemi Seçimi */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('url')}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${uploadMethod === 'url'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-link mr-2"></i>
                                        URL ile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('file')}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${uploadMethod === 'file'
                                            ? 'bg-[#D4AF37] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <i className="ri-upload-2-line mr-2"></i>
                                        Dosya Yükle
                                    </button>
                                </div>

                                {/* URL Girişi */}
                                {uploadMethod === 'url' && (
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                                        placeholder="Resim URL'si girin"
                                    />
                                )}

                                {/* Dosya Yükleme */}
                                {uploadMethod === 'file' && (
                                    <div>
                                        <label className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                disabled={uploadingImage}
                                            />
                                            {uploadingImage ? (
                                                <>
                                                    <i className="ri-loader-4-line text-4xl text-[#D4AF37] mb-2 animate-spin"></i>
                                                    <p className="text-sm text-gray-600">Yükleniyor...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-image-add-line text-4xl text-gray-400 mb-2"></i>
                                                    <p className="text-sm text-gray-600">
                                                        Resim seçmek için tıklayın
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Maksimum 5MB, JPG, PNG veya GIF
                                                    </p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Önizleme */}
                            {imageUrl && (
                                <div className="border border-gray-200 rounded-lg p-2">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Önizleme:</p>
                                    <img
                                        src={imageUrl}
                                        alt="Önizleme"
                                        className="w-full h-48 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Geçersiz+Resim';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setEditingImage(null);
                                    setImageUrl('');
                                    setUploadMethod('url');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveImage}
                                disabled={!imageUrl}
                                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
