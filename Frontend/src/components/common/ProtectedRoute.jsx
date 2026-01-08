import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuth();

  checkAuth(); // Verificar al cargar

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
