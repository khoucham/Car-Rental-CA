import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // Not logged in OR not admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
