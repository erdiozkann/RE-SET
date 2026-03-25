import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter basename="/">
            <ScrollToTop />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
