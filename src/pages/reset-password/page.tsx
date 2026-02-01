import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ToastContainer';
import SEO from '../../components/SEO';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    // URL'deki token'ı kontrol et
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                // Supabase recovery flow otomatik olarak session oluşturur
                if (session) {
                    setIsValidSession(true);
                } else {
                    // Hash'teki access_token kontrolü
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = hashParams.get('access_token');
                    const type = hashParams.get('type');

                    if (accessToken && type === 'recovery') {
                        // Token ile session oluştur
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: hashParams.get('refresh_token') || ''
                        });

                        if (!error) {
                            setIsValidSession(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            toast.success('Şifreniz başarıyla güncellendi!');

            // Çıkış yap ve login'e yönlendir
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1500);

        } catch (error: any) {
            console.error('Password update error:', error);
            toast.error(error.message || 'Şifre güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Session kontrol ediliyor
    if (checkingSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    // Geçersiz veya süresi dolmuş link
    if (!isValidSession) {
        return (
            <>
                <SEO
                    title="Geçersiz Link - RE-SET"
                    description="Şifre sıfırlama linki geçersiz veya süresi dolmuş."
                />
                <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <i className="ri-error-warning-line text-3xl text-red-500"></i>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Geçersiz Link</h1>
                            <p className="text-gray-600 text-sm mb-6">
                                Şifre sıfırlama linki geçersiz veya süresi dolmuş. Lütfen yeni bir link talep edin.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all"
                            >
                                <i className="ri-arrow-left-line"></i>
                                <span>Giriş Sayfasına Dön</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO
                title="Yeni Şifre Belirle - RE-SET"
                description="Hesabınız için yeni şifre belirleyin."
            />

            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Logo ve Başlık */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4">
                                <i className="ri-lock-password-line text-3xl text-white"></i>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Yeni Şifre Belirle</h1>
                            <p className="text-gray-600 text-sm">Hesabınız için yeni bir şifre oluşturun</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni Şifre
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="ri-lock-line text-gray-400"></i>
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                                        placeholder="En az 6 karakter"
                                        required
                                        minLength={6}
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Şifre Tekrar
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="ri-lock-line text-gray-400"></i>
                                    </div>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                                        placeholder="Şifrenizi tekrar girin"
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin"></i>
                                        <span>Güncelleniyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-check-line"></i>
                                        <span>Şifreyi Güncelle</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
