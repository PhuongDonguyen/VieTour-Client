import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  Users,
  MapPin,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Eye,
  DollarSign,
  Building,
  FileText,
  HelpCircle,
  BarChart3,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
  const location = useLocation();

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemLabel)
        ? prev.filter((item) => item !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  // Function to check if a route is active
  const isActive = (href?: string, subItems?: SubItem[]) => {
    if (href) {
      // Handle the case where /admin redirects to /admin/dashboard
      if (
        href === "/admin/dashboard" &&
        (location.pathname === "/admin" ||
          location.pathname === "/admin/dashboard")
      ) {
        return true;
      }
      return location.pathname === href;
    }
    // For parent items with sub-items, check if any sub-item is active
    if (subItems) {
      return subItems.some((subItem) => location.pathname === subItem.href);
    }
    return false;
  };

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: <Home className="w-4 h-4" />,
        allowedRoles: ["admin", "provider"],
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: <Users className="w-4 h-4" />,
        allowedRoles: ["admin"], // Only admins can manage users
      },
      {
        label: "Quản lý tour",
        href: "/admin/tours",
        icon: <MapPin className="w-4 h-4" />,
        allowedRoles: ["admin", "provider"],
      },
      {
        label: "Danh mục tour",
        href: "/admin/tours/categories",
        icon: <Eye className="w-4 h-4" />,
        allowedRoles: ["admin"], // Only admins can manage categories
      },
      {
        label: "Đặt tour",
        href: "/admin/bookings",
        icon: <Calendar className="w-4 h-4" />,
        allowedRoles: ["admin"],
      },
      {
        label: "Yêu cầu hoàn tiền",
        href: "/admin/cancellation-requests",
        icon: <DollarSign className="w-4 h-4" />,
        allowedRoles: ["admin", "provider"],
      },
      {
        label: "Đăng ký đối tác",
        href: "/admin/register-partners",
        icon: <Handshake className="w-4 h-4" />,
        allowedRoles: ["admin"],
      },
      {
        label: "Câu hỏi thường gặp",
        href: "/admin/general-questions",
        icon: <HelpCircle className="w-4 h-4" />,
        allowedRoles: ["admin"],
      },
      {
        label: "Quản lý bài viết",
        href: "/admin/blog",
        icon: <FileText className="w-4 h-4" />,
        allowedRoles: ["admin", "provider"],
      },
      {
        label: "Bài viết",
        icon: <FileText className="w-4 h-4" />,
        allowedRoles: ["admin", "provider"],
        subItems: [
          {
            label: "Tất cả bài viết",
            href: "/admin/blog",
            icon: <List className="w-4 h-4" />,
            allowedRoles: ["admin", "provider"],
          },
          {
            label: "Tạo bài viết",
            href: "/admin/blog/new",
            icon: <Plus className="w-4 h-4" />,
            allowedRoles: ["admin", "provider"],
          },
          {
            label: "Danh mục bài viết",
            href: "/admin/blog/categories",
            icon: <Eye className="w-4 h-4" />,
            allowedRoles: ["admin"], // Only admins can manage blog categories
          },
        ],
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: <Settings className="w-4 h-4" />,
        allowedRoles: ["admin"], // Only admins can access settings
      },
      // Provider-only sections
      {
        label: "Đơn đặt",
        href: "/admin/provider-bookings",
        icon: <Calendar className="w-4 h-4" />,
        allowedRoles: ["provider"], // Only providers can see their bookings
      },
      {
        label: "Earnings",
        href: "/admin/earnings",
        icon: <DollarSign className="w-4 h-4" />,
        allowedRoles: ["provider"], // Only providers can see their earnings
      },
      // {
      //   label: "Hồ sơ nhà cung cấp",
      //   href: "/admin/profile",
      //   icon: <Building className="w-4 h-4" />,
      //   allowedRoles: ["provider"], // Only providers can manage their profile
      // },
      {
        label: "Trả lời câu hỏi",
        href: "/admin/questions",
        icon: <FileText className="w-4 h-4" />,
        allowedRoles: ["provider"], // Only providers can see their questions
      },
    ],
    []
  );

  // Auto-expand parent items when their sub-items are active
  useEffect(() => {
    const expandParentsOfActiveItems = () => {
      const itemsToExpand: string[] = [];

      navItems.forEach((item) => {
        if (item.subItems) {
          const hasActiveSubItem = item.subItems.some(
            (subItem) => location.pathname === subItem.href
          );
          if (hasActiveSubItem && !expandedItems.includes(item.label)) {
            itemsToExpand.push(item.label);
          }
        }
      });

      if (itemsToExpand.length > 0) {
        setExpandedItems((prev) => [...prev, ...itemsToExpand]);
      }
    };

    expandParentsOfActiveItems();
  }, [location.pathname, navItems, expandedItems]);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.allowedRoles || !user?.role) return true;
    return item.allowedRoles.includes(user.role);
  });

  // Filter sub-items based on user role
  const filterSubItems = (subItems: SubItem[] | undefined) => {
    if (!subItems) return undefined;
    return subItems.filter((subItem) => {
      if (!subItem.allowedRoles || !user?.role) return true;
      return subItem.allowedRoles.includes(user.role);
    });
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isExpanded = expandedItems.includes(item.label);
    const filteredSubItems = filterSubItems(item.subItems);
    const hasFilteredSubItems = filteredSubItems && filteredSubItems.length > 0;
    const itemIsActive = isActive(item.href, filteredSubItems);

    return (
      <div key={index}>
        {hasFilteredSubItems ? (
          <Button
            variant={itemIsActive ? "secondary" : "ghost"}
            className="w-full justify-between h-10"
            onClick={() => toggleExpanded(item.label)}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <Button
            variant={itemIsActive ? "secondary" : "ghost"}
            className="w-full justify-start h-10"
            asChild
          >
            <Link to={item.href || "#"}>
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          </Button>
        )}

        {/* Render filtered sub-items if expanded */}
        {hasFilteredSubItems && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {filteredSubItems!.map((subItem, subIndex) => {
              const subItemIsActive = location.pathname === subItem.href;
              return (
                <Button
                  key={subIndex}
                  variant={subItemIsActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-9 text-sm",
                    subItemIsActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  asChild
                >
                  <Link to={subItem.href}>
                    {subItem.icon}
                    <span className="ml-3">{subItem.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "w-64 bg-background border-r hidden md:flex md:flex-col",
        className
      )}
    >
      <div className="h-16 flex items-center justify-center border-b">
        <h2 className="text-xl font-bold">VieTour Tourist</h2>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {filteredNavItems.map((item, index) => renderNavItem(item, index))}
        </div>
        <Separator className="my-4" />
        <div className="text-sm text-muted-foreground px-2">Quick Actions</div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
