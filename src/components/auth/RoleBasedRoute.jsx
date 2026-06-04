import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleBasedRoute({ children, role }) {
  const { role: userRole, loading } = useAuth();

  if (loading) return <div className="text-white p-10">Loading...</div>;

  if (userRole !== role) {
    // Redirect based on actual role
    return userRole === "admin"
      ? <Navigate to="/admin/dashboard" />
      : <Navigate to="/customer/dashboard" />;
  }

  return children;
}
