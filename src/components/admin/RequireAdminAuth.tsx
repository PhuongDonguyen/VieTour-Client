import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const RequireAdminAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to admin login page, preserve the current location for redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Optionally, add admin role check here if needed
  return <>{children}</>;
};

export default RequireAdminAuth; 