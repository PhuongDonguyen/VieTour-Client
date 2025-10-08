import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    title = "Dashboard",
    className = ""
}) => {
    return (
        <div className={cn("flex min-h-screen bg-muted/50", className)}>
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader title={title} />
                <main className="flex-1 space-y-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
