import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const RequireAdminAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user || user?.role == 'user') {
    console.log("You are not admin")
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAdminAuth; 