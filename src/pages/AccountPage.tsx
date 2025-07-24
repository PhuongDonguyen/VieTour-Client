import React, { useState} from "react";
import { useParams } from "react-router-dom";
import { NavigationUser } from "@/components/NavigationProfile";
import { ProfilePage } from "@/components/ProfileUser";
import { ChangePasswordForm } from "@/components/ChangepwForm";
import MyBooking from '@/components/MyBooking'

const AccountPage: React.FC = () => {
const {active}  = useParams<{ active: string }>();
  const [activeTab, setActiveTab] = useState<string>(active??"profile");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <p>📊 Đây là trang tổng quan tài khoản.</p>;
      case "profile":
        return <ProfilePage />;
      case "password":
        return <ChangePasswordForm />;
      case "my-bookings":
        return <MyBooking/>;
      case "tours":
        return <p>🧳 Các chuyến đi bạn đã tham gia.</p>;
      case "settings":
        return <p>⚙️ Tuỳ chỉnh tài khoản tại đây.</p>;
      default:
        return <p>Vui lòng chọn một tab từ sidebar.</p>;
    }
  };

  return (
    <div className="flex justify-center bg-gray-50">
      <div className="w-full max-w-[1600px] flex">
        {/* Sidebar trái */}
        <div className="w-80 pt-20">
          <div className="sticky top-[80px] bg-white border border-gray-200 rounded-xl shadow-sm">
            <NavigationUser activeTab={activeTab} onChangeTab={setActiveTab} />
          </div>
        </div>

        {/* Nội dung bên phải */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Trang: {activeTab} */}
          <div className="text-gray-700">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
