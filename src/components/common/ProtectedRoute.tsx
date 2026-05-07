import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, role, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen space-x-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="font-black uppercase tracking-widest text-slate-400">Authenticating operational credentials...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRoles && role) {
    const hasPermission = requiredRoles.includes(role);
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  } else if (!isAdmin) {
    // Default admin protection if no roles specified but in admin layout
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
