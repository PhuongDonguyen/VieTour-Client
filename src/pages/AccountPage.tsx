import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProfilePage } from "@/components/ProfileUser";
import { ChangePasswordForm } from "@/components/ChangepwForm";
import MyBooking from "@/components/MyBooking";
import CancellationRequests from "@/components/CancellationRequests";
import CancellationRequestsProvider from "@/pages/admin/AdminCancellationRequests";
import AdminBookings from "@/pages/admin/AdminBookings";
import { fetchUserProfile } from "@/services/userProfile.service";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Lock,
  Calendar,
  XCircle,
  Bell,
  Settings,
  DollarSign,
  BookOpen,
  LogOut,
} from "lucide-react";

interface user {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  email: string;
}

const AccountPage: React.FC = () => {
  const [userCurrent, setUserCurrent] = useState<user | null>(null);
  const { active } = useParams<{ active: string }>();
  const [activeTab, setActiveTab] = useState<string>(active ?? "profile");
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchUserProfile();
        const userData = response.data;
        setUserCurrent(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === "provider-cancellation-requests") {
      navigate("/provider/cancellation-requests");
      return;
    }

    if (tab === "provider-bookings") {
      navigate("/admin/provider-bookings");
      return;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage />;
      case "password":
        return <ChangePasswordForm />;
      case "my-bookings":
        return <MyBooking />;
      case "cancellation-requests":
        return <CancellationRequests />;
      case "provider-cancellation-requests":
        return <CancellationRequestsProvider />;
      case "provider-bookings":
        return <AdminBookings />;
      case "notifications":
        return (
          <div className="space-y-6">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có thông báo
              </h3>
              <p className="text-gray-600">
                Bạn sẽ nhận được thông báo khi có cập nhật mới
              </p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Settings className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cài đặt tài khoản
              </h3>
              <p className="text-gray-600">
                Tùy chỉnh các cài đặt tài khoản của bạn
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chào mừng bạn trở lại!
              </h3>
              <p className="text-gray-600">
                Chọn một tùy chọn từ menu để bắt đầu quản lý tài khoản
              </p>
            </div>
          </div>
        );
    }
  };

  const menuItems = [
    {
      id: "profile",
      label: "Thông tin cá nhân",
      icon: User,
      description: "Quản lý hồ sơ cá nhân",
    },
    {
      id: "password",
      label: "Bảo mật",
      icon: Lock,
      description: "Đổi mật khẩu",
    },
    {
      id: "my-bookings",
      label: "Tour đã đặt",
      icon: Calendar,
      description: "Lịch sử tour đã đặt",
    },
    {
      id: "cancellation-requests",
      label: "Yêu cầu hủy tour",
      icon: XCircle,
      description: "Theo dõi yêu cầu hủy",
      // badge: "1",
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
      description: "Quản lý thông báo",
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: Settings,
      description: "Tùy chỉnh tài khoản",
    },
    ...(authUser?.role === "provider"
      ? [
          {
            id: "provider-cancellation-requests",
            label: "Yêu cầu hoàn tiền",
            icon: DollarSign,
            description: "Quản lý hoàn tiền",
          },
          {
            id: "provider-bookings",
            label: "Quản lý đặt tour",
            icon: BookOpen,
            description: "Quản lý đặt tour",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                    {userCurrent?.avatar ? (
                      <img
                        src={userCurrent.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{userCurrent?.first_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userCurrent?.first_name} {userCurrent?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {userCurrent?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <nav className="p-4">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            isActive
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              isActive ? "text-blue-600" : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Logout */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full group flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200">
                    <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-8">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
