import React from "react";
import RequireRole from "./RequireRole";

// Helper components for common role combinations

interface AuthWrapperProps {
    children: React.ReactNode;
}

// Allows both admin and provider roles
export const RequireAdminAccess: React.FC<AuthWrapperProps> = ({ children }) => (
    <RequireRole allowedRoles={['admin', 'provider']}>
        {children}
    </RequireRole>
);

// Only admin role
export const RequireAdminOnly: React.FC<AuthWrapperProps> = ({ children }) => (
    <RequireRole allowedRoles={['admin']}>
        {children}
    </RequireRole>
);

// Only provider role
export const RequireProviderOnly: React.FC<AuthWrapperProps> = ({ children }) => (
    <RequireRole allowedRoles={['provider']}>
        {children}
    </RequireRole>
);

// Custom role combinations
export const RequireCustomRoles: React.FC<AuthWrapperProps & { roles: string[] }> = ({
    children,
    roles
}) => (
    <RequireRole allowedRoles={roles}>
        {children}
    </RequireRole>
);
