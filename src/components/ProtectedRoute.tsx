import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStaff?: boolean;
  loginPath?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, requireStaff = false, loginPath = "/login", allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, isStaff, userRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Redirect to admin login if staff access is required but user is not staff
  if (requireStaff && !isStaff) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // If staff but without correct role, send to dashboard. Else login.
      return <Navigate to={isStaff ? "/admin" : "/login"} replace />;
    }
  }

  // All checks passed — render children immediately
  return <>{children}</>;
};
