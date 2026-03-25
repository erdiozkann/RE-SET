import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initClarity } from './lib/clarity'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

initClarity()

const BUILD_VERSION = 'v1.0.1'; // Bump this to force clear cache
const CACHE_KEY = 'reset_app_version';

try {
  const currentVersion = localStorage.getItem(CACHE_KEY);
  if (currentVersion !== BUILD_VERSION) {
    // Sadece versiyonu güncelle, auth token'ı silme!
    // localStorage.clear(); // <--- BU SATIR KALDIRILDI (Auth token'ı siliyordu)
    localStorage.setItem(CACHE_KEY, BUILD_VERSION);
    console.log(`App updated to ${BUILD_VERSION}`);
  }
} catch (e) {
  console.error('Cache version check failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
