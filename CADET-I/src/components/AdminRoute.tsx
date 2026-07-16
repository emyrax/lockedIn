import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
