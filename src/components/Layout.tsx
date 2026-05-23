import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './feature/Header';
import Footer from './feature/Footer';
import CookieBanner from './feature/CookieBanner';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-[#1A1A1A] focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      >
        İçeriğe atla
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <AnimatePresence mode="wait">
          <Suspense fallback={null}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
