import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

interface RequireRoleProps {
    children: React.ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

const RequireRole: React.FC<RequireRoleProps> = ({
    children,
    allowedRoles,
    redirectTo = "/admin/login"
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user) {
        console.log("User not authenticated");
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (!allowedRoles.includes(user.role)) {
        console.log(`Access denied. User role: ${user.role}, Required roles: ${allowedRoles.join(', ')}`);

        // You can customize this based on your needs:
        // Option 1: Redirect to login
        // return <Navigate to={redirectTo} state={{ from: location }} replace />;

        // Option 2: Show access denied page
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/50">
                <div className="text-center p-8 bg-background rounded-lg shadow-lg max-w-md">
                    <div className="text-destructive text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-4">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Required roles: {allowedRoles.join(', ')}
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RequireRole;
