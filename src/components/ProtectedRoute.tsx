import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Yükleme durumu
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    // Giriş yapmamış
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin gerekli ama kullanıcı admin değil
    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/client-panel" replace />;
    }

    return <>{children}</>;
}

