import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RoleProtectedRoute({ canAccess }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Vérification de la session…</p>
      </div>
    );
  }

  if (!user || !canAccess(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
