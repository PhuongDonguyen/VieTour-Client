import React, { useState } from 'react';
import { Home, Users, MapPin, Calendar, Settings, ChevronDown, ChevronRight, Plus, List, Eye, DollarSign, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
    className?: string;
}

interface SubItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    allowedRoles?: string[];
}

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    active?: boolean;
    subItems?: SubItem[];
    allowedRoles?: string[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = "" }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const { user } = useAuth();

    const toggleExpanded = (itemLabel: string) => {
        setExpandedItems(prev =>
            prev.includes(itemLabel)
                ? prev.filter(item => item !== itemLabel)
                : [...prev, itemLabel]
        );
    };

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/admin/dashboard',
            icon: <Home className="w-4 h-4" />,
            active: true,
            allowedRoles: ['admin', 'provider']
        },
        {
            label: 'Users',
            href: '/admin/users',
            icon: <Users className="w-4 h-4" />,
            allowedRoles: ['admin'] // Only admins can manage users
        },
        {
            label: 'Tours',
            icon: <MapPin className="w-4 h-4" />,
            allowedRoles: ['admin', 'provider'],
            subItems: [
                {
                    label: 'All Tours',
                    href: '/admin/tours',
                    icon: <List className="w-4 h-4" />,
                    allowedRoles: ['admin', 'provider']
                },
                {
                    label: 'Add New Tour',
                    href: '/admin/tours/new',
                    icon: <Plus className="w-4 h-4" />,
                    allowedRoles: ['admin', 'provider']
                },
                {
                    label: 'Tour Categories',
                    href: '/admin/tours/categories',
                    icon: <Eye className="w-4 h-4" />,
                    allowedRoles: ['admin'] // Only admins can manage categories
                },
            ]
        },
        {
            label: 'Bookings',
            href: '/admin/bookings',
            icon: <Calendar className="w-4 h-4" />,
            allowedRoles: ['admin', 'provider']
        },
        {
            label: 'Settings',
            href: '/admin/settings',
            icon: <Settings className="w-4 h-4" />,
            allowedRoles: ['admin'] // Only admins can access settings
        },
        // Provider-only sections
        {
            label: 'My Tours',
            href: '/admin/my-tours',
            icon: <MapPin className="w-4 h-4" />,
            allowedRoles: ['provider'] // Only providers can see their own tours
        },
        {
            label: 'My Bookings',
            href: '/admin/my-bookings',
            icon: <Calendar className="w-4 h-4" />,
            allowedRoles: ['provider'] // Only providers can see their bookings
        },
        {
            label: 'Earnings',
            href: '/admin/earnings',
            icon: <DollarSign className="w-4 h-4" />,
            allowedRoles: ['provider'] // Only providers can see their earnings
        },
        {
            label: 'Company Profile',
            href: '/admin/profile',
            icon: <Building className="w-4 h-4" />,
            allowedRoles: ['provider'] // Only providers can manage their profile
        },
    ];

    // Filter navigation items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!item.allowedRoles || !user?.role) return true;
        return item.allowedRoles.includes(user.role);
    });

    // Filter sub-items based on user role
    const filterSubItems = (subItems: SubItem[] | undefined) => {
        if (!subItems) return undefined;
        return subItems.filter(subItem => {
            if (!subItem.allowedRoles || !user?.role) return true;
            return subItem.allowedRoles.includes(user.role);
        });
    };

    const renderNavItem = (item: NavItem, index: number) => {
        const isExpanded = expandedItems.includes(item.label);
        const filteredSubItems = filterSubItems(item.subItems);
        const hasFilteredSubItems = filteredSubItems && filteredSubItems.length > 0;

        return (
            <div key={index}>
                {hasFilteredSubItems ? (
                    <Button
                        variant={item.active ? "secondary" : "ghost"}
                        className="w-full justify-between h-10"
                        onClick={() => toggleExpanded(item.label)}
                    >
                        <div className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </div>
                        {isExpanded ?
                            <ChevronDown className="w-4 h-4" /> :
                            <ChevronRight className="w-4 h-4" />
                        }
                    </Button>
                ) : (
                    <Button
                        variant={item.active ? "secondary" : "ghost"}
                        className="w-full justify-start h-10"
                        asChild
                    >
                        <a href={item.href}>
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </a>
                    </Button>
                )}

                {/* Render filtered sub-items if expanded */}
                {hasFilteredSubItems && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                        {filteredSubItems!.map((subItem, subIndex) => (
                            <Button
                                key={subIndex}
                                variant="ghost"
                                className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground"
                                asChild
                            >
                                <a href={subItem.href}>
                                    {subItem.icon}
                                    <span className="ml-3">{subItem.label}</span>
                                </a>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className={cn("w-64 bg-background border-r hidden md:flex md:flex-col", className)}>
            <div className="h-16 flex items-center justify-center border-b">
                <h2 className="text-xl font-bold">VieTour Tourist</h2>
            </div>
            <nav className="flex-1 p-4">
                <div className="space-y-1">
                    {filteredNavItems.map((item, index) => renderNavItem(item, index))}
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground px-2">
                    Quick Actions
                </div>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
