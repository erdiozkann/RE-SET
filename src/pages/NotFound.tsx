import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Sayfa Bulunamadı"
        description="Aradığınız sayfa bulunamadı."
        noindex
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-[#D4AF37] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Sayfa Bulunamadı</h2>
          <p className="text-gray-600 mb-8">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#D4AF37] text-[#1A1A1A] px-8 py-3 font-semibold whitespace-nowrap cursor-pointer transition-all hover:bg-[#C19B2E]"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>

    </>
  );
}
