import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
    title?: string;
    className?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    title = "Dashboard",
    className = ""
}) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    const getUserDisplayName = () => {
        if (user?.role === 'admin') {
            return `${user.first_name} ${user.last_name}`;
        } else {
            return user?.company_name || user?.email || 'Admin User';
        }
    };

    const getRoleBadgeVariant = () => {
        switch (user?.role) {
            case 'admin':
                return 'destructive'; // Red for admin
            case 'provider':
                return 'secondary'; // Blue for provider
            default:
                return 'outline';
        }
    };

    return (
        <header className={cn("h-16 bg-background border-b flex items-center px-6 justify-between", className)}>
            <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold">{title}</h1>
                <Badge variant={getRoleBadgeVariant()} className="text-xs">
                    {user?.role?.toUpperCase() || 'ADMIN'}
                </Badge>
            </div>
            <div className="relative" ref={menuRef}>
                {/* User menu */}
                <Button
                    variant="ghost"
                    className="flex items-center space-x-2 px-4 py-2 h-auto"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium">
                            {getUserDisplayName()}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                            {user?.role || 'Administrator'}
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>

                {/* Dropdown menu */}
                {showUserMenu && (
                    <Card className="absolute right-0 mt-2 py-1 z-50 shadow-lg">
                        <div className="px-4 py-3">
                            <div className="font-medium text-sm truncate" title={getUserDisplayName()}>
                                {getUserDisplayName()}
                            </div>
                            <div className="text-muted-foreground text-xs truncate mt-1" title={user?.email}>
                                {user?.email}
                            </div>
                        </div>
                        <Separator />
                        <div className="p-1">
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="flex items-center w-full justify-start px-3 py-2 text-sm h-auto hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;
