import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authHelpers } from '../../lib/supabase';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import { useToast } from '../../components/ToastContainer';
import SEO from '../../components/SEO';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authHelpers.signIn(email, password);

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      setLoading(false);

      // Rol bazlı yönlendirme
      setTimeout(() => {
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/client-panel');
        }
      }, 500);

    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Giriş Yap - RE-SET Psikolojik Danışmanlık"
        description="RE-SET Psikolojik Danışmanlık hesabınıza giriş yapın. Randevularınızı yönetin, ilerleme kayıtlarınızı görüntüleyin."
        keywords="giriş, login, danışan girişi, admin girişi"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo ve Başlık */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4">
                <i className="ri-user-line text-3xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h1>
              <p className="text-gray-600 text-sm">Hesabınıza giriş yapın</p>
            </div>

            {/* Giriş Formu */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-mail-line text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                    placeholder="ornek@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
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
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line"></i>
                    <span>Giriş Yap</span>
                  </>
                )}
              </button>
            </form>

            {/* Kayıt Linki */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link 
                  to="/register" 
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Kayıt Olun
                </Link>
              </p>
            </div>

            {/* Ana Sayfaya Dön */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="ri-arrow-left-line"></i>
                <span>Ana Sayfaya Dön</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
