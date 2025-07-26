import { useEffect } from 'react';
import {
  User,
  Lock,
  MapPin,
  Calendar,
  LogOut,
} from 'lucide-react';
import type { FC } from 'react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface NavigationUserProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  user?: user; // Optional user prop for profile info
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
  const menuItems: MenuItem[] = [
    // { id: 'dashboard', label: 'Trang chủ', icon: Home, description: 'Tổng quan tài khoản' },
    { id: 'profile', label: 'Thông tin cá nhân', icon: User, description: 'Quản lý hồ sơ của bạn' },
    { id: 'password', label: 'Thay đổi mật khẩu', icon: Lock, description: 'Bảo mật tài khoản' },
    { id: 'my-bookings', label: 'Đặt vé của tôi', icon: Calendar, description: 'Lịch sử đặt tour' },
    { id: 'tours', label: 'Tour đã đặt', icon: MapPin, description: 'Các chuyến đi đã book' },
    // { id: 'settings', label: 'Cài đặt', icon: Settings, description: 'Tùy chỉnh tài khoản' },
  ];

  useEffect(() => {
    console.log("email:", user?.email);
  }, []);

  return (
    <div className="w-80 max-h-screen bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-100">
      {/* Profile Header */}
      <div className="p-6 bg-gradient-to-r bg-[#FF6B35] text-white relative">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-md">
            <img
              src={user?.avatar || "/public/avatar-default.jpg"}
              alt="Profile Avatar"
              className="w-full h-full object-cover rounded-full border-[#FF6B35] border-2"
            />
          </div>
          <h3 className="font-semibold text-lg">{user?.first_name} {user?.last_name}</h3>
          {/* <p className="text-sm text-gray-200">{user?.email}</p> */}
          {/* <div className="mt-2 inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
            Thành viên VIP
          </div> */}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {menuItems.map(({ id, label, icon: Icon, description }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => onChangeTab(id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#FF6B35] text-white shadow-lg scale-[1.02]'
                  : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
              <div
                className={`p-2 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-white bg-opacity-20'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}
              >
                <Icon size={18} className={`${isActive ? 'text-black' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{label}</div>
                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {description}
                </div>
              </div>
              {isActive && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group">
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition">
            <LogOut size={16} className="group-hover:text-red-600" />
          </div>
          <span className="font-medium text-sm">Đăng xuất</span>
        </button>
        <div className="mt-3 text-center text-xs text-gray-400">
          <p>VieTour v2.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
};
