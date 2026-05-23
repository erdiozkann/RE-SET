-- ============================================
-- 🔐 KULLANICI KAYIT HATASI DÜZELTME (SIGN-UP FIX)
-- ============================================
-- Bu betik, yeni kullanıcı kaydolurken (signUp) oluşan "Database error saving new user" hatasını giderir.
-- Hataya neden olan RLS (Insert) politikasını ekler ve Auth tetikleyicisini yönetici yetkileriyle (SECURITY DEFINER) yeniden tanımlar.

-- 1. public.users tablosu için RLS INSERT (Ekleme) politikasını oluşturun
-- (Bu sayede tetikleyici veya kayıt servisi yeni profil satırı ekleyebilir)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
CREATE POLICY "Enable insert for all users" ON public.users 
    FOR INSERT 
    WITH CHECK (true);

-- 2. Yeni kullanıcı tetikleyici fonksiyonunu (trigger function) güncelleyin
-- (Önemli: SECURITY DEFINER yetkisi sayesinde tetikleyici RLS engellerine takılmadan çalışır)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, approved, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Kullanıcı'),
    'CLIENT',
    FALSE,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Tetikleyicinin (trigger) auth.users tablosunda aktif olduğundan emin olun
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
