
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authHelpers } from '../../lib/supabase';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import { useToast } from '../../components/ToastContainer';
import SEO from '../../components/SEO';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return { valid: false, error: 'Şifre en az 8 karakter olmalıdır' };
    if (!/[A-Z]/.test(pwd)) return { valid: false, error: 'Şifre en az bir büyük harf içermelidir' };
    if (!/[.,!?;:'"()@#$%^&*\-_=+]/.test(pwd)) return { valid: false, error: 'Şifre en az bir noktalama işareti içermelidir' };
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.valid) {
      toast.error(validation.error || 'Geçersiz şifre');
      return;
    }

    setLoading(true);

    try {
      await authHelpers.signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );

      toast.success('Kayıt başarılı! Admin onayından sonra giriş yapabileceksiniz.');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <>
        <SEO 
          title="Kayıt Başarılı - Reset Danışmanlık"
          description="Reset Danışmanlık kayıt işlemi başarılı"
        />
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-3xl text-green-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Başarılı!</h2>
            <p className="text-gray-600 mb-4">
              Hesabınız oluşturuldu. Admin onayından sonra giriş yapabileceksiniz.
            </p>
            <p className="text-sm text-gray-500">
              Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Kayıt Ol - Reset Danışmanlık"
        description="Reset Danışmanlık hesabı oluşturun"
      />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Reset
              </h1>
            </Link>
            <p className="mt-2 text-gray-600">Yeni hesap oluşturun</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon (Opsiyonel)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                  placeholder="0532 123 4567"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                  placeholder="En az 8 karakter, 1 büyük harf, 1 noktalama işareti"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Şifre en az 8 karakter ve bir büyük harf, bir noktalama işareti içermelidir
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                  placeholder="Şifrenizi tekrar girin"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
