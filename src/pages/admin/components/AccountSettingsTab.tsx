import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';

export default function AccountSettingsTab() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [emailForm, setEmailForm] = useState({
    currentEmail: '',
    newEmail: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        // Login'e yönlendirme yapmıyoruz, boş state ile devam ediyoruz
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Users query error:', error);
        // Hata olsa bile sayfayı göster, email'i localStorage'dan al
        setCurrentUser({ email: userEmail });
        setEmailForm({ currentEmail: userEmail, newEmail: '' });
        setLoading(false);
        return;
      }

      if (data) {
        setCurrentUser(data);
        setEmailForm({ currentEmail: data.email, newEmail: '' });
      } else {
        // Kullanıcı bulunamadı, localStorage'dan devam et
        setCurrentUser({ email: userEmail });
        setEmailForm({ currentEmail: userEmail, newEmail: '' });
      }
      setLoading(false);
    } catch (error) {
      console.error('LoadCurrentUser error:', error);
      const userEmail = localStorage.getItem('userEmail') || '';
      setCurrentUser({ email: userEmail });
      setEmailForm({ currentEmail: userEmail, newEmail: '' });
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail) {
      toast.error('Lütfen yeni e-posta adresini girin');
      return;
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      toast.error('Geçerli bir e-posta adresi girin');
      return;
    }

    try {
      // E-posta zaten kullanılıyor mu kontrol et
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', emailForm.newEmail)
        .single();

      if (existingUser) {
        toast.error('Bu e-posta adresi zaten kullanılıyor');
        return;
      }

      // E-posta güncelle
      const { error } = await supabase
        .from('users')
        .update({ email: emailForm.newEmail })
        .eq('email', emailForm.currentEmail);

      if (error) throw error;

      // LocalStorage'ı güncelle
      localStorage.setItem('userEmail', emailForm.newEmail);

      toast.success('E-posta başarıyla güncellendi');

      // Formu sıfırla
      setEmailForm({ currentEmail: emailForm.newEmail, newEmail: '' });
      await loadCurrentUser();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`E-posta güncellenirken hata: ${message}`);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      // Mevcut şifreyi kontrol et
      const { data: user } = await supabase
        .from('users')
        .select('password')
        .eq('email', currentUser.email)
        .single();

      if (!user || user.password !== passwordForm.currentPassword) {
        toast.error('Mevcut şifre yanlış');
        return;
      }

      // Şifreyi güncelle
      const { error } = await supabase
        .from('users')
        .update({ password: passwordForm.newPassword })
        .eq('email', currentUser.email);

      if (error) throw error;

      toast.success('Şifre başarıyla güncellendi');

      // Formu sıfırla
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Şifre güncellenirken hata: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-[#D4AF37] animate-spin"></i>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Hesap Ayarları</h2>
        <p className="text-gray-600 mt-2">E-posta adresinizi ve şifrenizi güncelleyin</p>
      </div>

      {/* E-posta Değiştirme */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6 flex items-center gap-2">
          <i className="ri-mail-line text-[#D4AF37]"></i>
          E-posta Adresi Değiştir
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut E-posta
            </label>
            <input
              type="email"
              value={emailForm.currentEmail}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni E-posta
            </label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              placeholder="yeni@email.com"
            />
          </div>

          <button
            onClick={handleEmailChange}
            className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-save-line mr-2"></i>
            E-posta Güncelle
          </button>
        </div>
      </div>

      {/* Şifre Değiştirme */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6 flex items-center gap-2">
          <i className="ri-lock-password-line text-[#D4AF37]"></i>
          Şifre Değiştir
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              placeholder="Mevcut şifreniz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              placeholder="En az 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              placeholder="Yeni şifrenizi tekrar girin"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-save-line mr-2"></i>
            Şifre Güncelle
          </button>
        </div>
      </div>

      {/* Güvenlik Notları */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <i className="ri-information-line text-blue-600 text-xl flex-shrink-0"></i>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Güvenlik İpuçları</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Şifreniz en az 6 karakter olmalıdır</li>
              <li>• Güçlü bir şifre için harf, rakam ve özel karakterler kullanın</li>
              <li>• Şifrenizi düzenli olarak değiştirin</li>
              <li>• Şifrenizi kimseyle paylaşmayın</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
