import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = () => {
      // If still loading auth state, don't make decisions yet
      if (loading) {
        return;
      }

      // If authentication is not required, always allow access
      if (!requireAuth) {
        setIsAuthorized(true);
        return;
      }

      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        setIsAuthorized(false);
        return;
      }

      // If admin access is required, check user role/permissions
      if (requireAdmin && user) {
        // For now, check if user email contains 'admin' or has specific email
        // In production, you'd check a proper role field
        const isAdmin =
          user.email.includes("admin") ||
          user.email === "admin@onboardticket.com" ||
          user.email === "adebayo@onboardticket.com";

        setIsAuthorized(isAdmin);
        return;
      }

      // If we reach here, user is authenticated and no admin requirement
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [user, isAuthenticated, loading, requireAuth, requireAdmin]);

  // Show loading spinner while checking auth/authorization
  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#E7E9FF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#3839C9]" />
          <h2 className="text-xl font-semibold text-[#3839C9] mb-2">
            Verifying access...
          </h2>
          <p className="text-[#637996]">
            Please wait while we check your permissions
          </p>
        </div>
      </div>
    );
  }

  // If not authorized, redirect
  if (!isAuthorized) {
    const redirectPath = requireAdmin ? "/login?admin=required" : redirectTo;

    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // If authorized, render the protected content
  return <>{children}</>;
}

// Convenience components for common protection patterns
export const AuthProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute requireAuth={true}>{children}</ProtectedRoute>;

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute
    requireAuth={true}
    requireAdmin={true}
    redirectTo="/login?admin=required"
  >
    {children}
  </ProtectedRoute>
);

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
