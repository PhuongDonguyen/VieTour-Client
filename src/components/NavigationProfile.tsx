import { useEffect } from "react";
import {
  User,
  Lock,
  Calendar,
  LogOut,
  XCircle,
  DollarSign,
  BookOpen,
  Settings,
  Bell,
  Shield,
} from "lucide-react";
import type { FC } from "react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
  allowedRoles?: string[];
}

interface NavigationUserProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  user?: user;
}

interface user {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  email: string;
}

export const NavigationUser: FC<NavigationUserProps> = ({
  activeTab,
  onChangeTab,
  user,
}) => {
  const { user: authUser } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      label: "Thông tin cá nhân",
      icon: User,
      description: "Quản lý hồ sơ và thông tin cá nhân",
    },
    {
      id: "password",
      label: "Bảo mật",
      icon: Shield,
      description: "Thay đổi mật khẩu và bảo mật tài khoản",
    },
    {
      id: "my-bookings",
      label: "Xem tour đã đặt",
      icon: Calendar,
      description: "Xem lịch sử và quản lý đặt tour",
      badge: "3",
    },
    {
      id: "cancellation-requests",
      label: "Yêu cầu hủy tour",
      icon: XCircle,
      description: "Theo dõi trạng thái yêu cầu hủy tour",
      badge: "1",
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
      description: "Quản lý thông báo và cập nhật",
    },
    // {
    //   id: "settings",
    //   label: "Cài đặt",
    //   icon: Settings,
    //   description: "Tùy chỉnh cài đặt tài khoản",
    // },
    {
      id: "provider-cancellation-requests",
      label: "Yêu cầu hoàn tiền",
      icon: DollarSign,
      description: "Quản lý yêu cầu hoàn tiền",
      allowedRoles: ["provider"],
    },
    {
      id: "provider-bookings",
      label: "Quản lý đặt tour",
      icon: BookOpen,
      description: "Quản lý đặt tour của khách hàng",
      allowedRoles: ["provider"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(authUser?.role || "");
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tài khoản</h1>
            <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* User Profile */}
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{user?.first_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  {filteredMenuItems.map(({ id, label, icon: Icon, description, badge }) => {
                    const isActive = activeTab === id;
                    
                    return (
                      <button
                        key={id}
                        onClick={() => onChangeTab(id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                          isActive
                            ? "bg-blue-50 border border-blue-200 text-blue-700"
                            : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{label}</span>
                            {badge && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${
                            isActive ? "text-blue-600" : "text-gray-500"
                          }`}>
                            {description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-1 h-8 bg-blue-500 rounded-full absolute right-2"></div>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group">
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
                      <LogOut size={18} className="group-hover:text-red-600" />
                    </div>
                    <span className="font-medium text-sm">Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User size={24} className="text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Chào mừng bạn trở lại!
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Chọn một tùy chọn từ menu bên trái để bắt đầu quản lý tài khoản của bạn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>VieTour v2.0 • © 2024 All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};
