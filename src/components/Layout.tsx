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
      <Header />
      <main className="flex-1">
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
