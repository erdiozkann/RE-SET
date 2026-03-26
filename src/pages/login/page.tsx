import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import { useToast } from '../../components/ToastContainer';
import SEO from '../../components/SEO';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { signIn, resetPassword, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Şifremi Unuttum Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (!authLoading && user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const fromIsAdminRoute = from?.startsWith('/admin');

      if (user.role === 'ADMIN') {
        navigate(from || '/admin', { replace: true });
      } else if (user.approved) {
        // Non-admin users should never be redirected back into admin routes
        const safeTarget = from && !fromIsAdminRoute ? from : '/client-panel';
        navigate(safeTarget, { replace: true });
      } else {
        // Unapproved users should not get stuck in loading state
        setLoading(false);
      }
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Login attempt started:', { email });
      const loggedInUser = await signIn(email, password);
      console.log('Login successful:', loggedInUser);

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');

      // Explicit navigation for immediate feedback
      console.log('Determining navigation path for role:', loggedInUser.role);

      if (loggedInUser.role === 'ADMIN') {
        console.log('Redirecting to /admin');
        navigate('/admin', { replace: true });
      } else if (loggedInUser.approved) {
        console.log('Redirecting to /client-panel');
        navigate('/client-panel', { replace: true });
      } else {
        console.warn('User not approved, staying on page');
        // Stay on page, show toast (already handled by error in AuthContext usually, but if success returns unapproved?)
        // AuthContext throws if unapproved, so we actually won't reach here for unapproved users effectively.
        // But if we do (e.g. slight race), we just stop loading.
        setLoading(false);
      }

    } catch (error) {
      console.error('Login error caught in page:', error);
      const message = getUserFriendlyErrorMessage(error);
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  // Şifre Sıfırlama
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      toast.success('Şifre sıfırlama linki e-posta adresinize gönderildi!');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
    } finally {
      setResetLoading(false);
    }
  };

  // No manual loader to avoid flash


  return (
    <>
      <SEO
        title="Giriş Yap - RE-SET Demartini Metodu"
        description="RE-SET Demartini Metodu hesabınıza giriş yapın. Randevularınızı yönetin, ilerleme kayıtlarınızı görüntüleyin."
        keywords="giriş, login, danışan girişi, admin girişi"
        noindex
      />

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo ve Başlık */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4">
                <i className="ri-user-line text-3xl text-white"></i>
              </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.login_title')}</h1>
                <p className="text-gray-600 text-sm">{t('auth.login_subtitle')}</p>
              </div>
  
              {/* Giriş Formu */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                  <div className="flex items-start gap-3">
                    <i className="ri-error-warning-line text-red-600 text-xl mt-0.5"></i>
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}
  
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
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
                  {t('auth.password')}
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

              {/* Şifremi Unuttum Linki */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email); // Mevcut email'i aktar
                    setShowResetModal(true);
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  {t('auth.forgot_password_link')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span>{t('auth.logging_in')}</span>
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line"></i>
                    <span>{t('auth.login_button')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Kayıt Linki */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.no_account')}{' '}
                <Link
                  to="/register"
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  {t('auth.register_link')}
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
                <span>{t('auth.back_to_home')}</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Şifremi Unuttum Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('auth.forgot_password_modal.title')}</h2>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {t('auth.forgot_password_modal.description')}
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-mail-line text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                    placeholder="ornek@email.com"
                    required
                    disabled={resetLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                   onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={resetLoading}
                >
                  {t('auth.forgot_password_modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>{t('auth.forgot_password_modal.sending')}</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-mail-send-line"></i>
                      <span>{t('auth.forgot_password_modal.send')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
