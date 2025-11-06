import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * - Shows a modern branded loading screen while auth state loads
 * - Redirects if not logged in
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[rgb(var(--bg))]">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            {/* Branded Loader */}
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-black/10 dark:border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[rgb(var(--brand-600))] animate-spin"></div>
            </div>
            <p className="text-sm text-[rgb(var(--muted))]">Checking authentication...</p>
          </div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
