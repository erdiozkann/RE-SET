import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContainer';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter basename="/">
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
