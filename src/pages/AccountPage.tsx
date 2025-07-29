import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavigationUser } from "@/components/NavigationProfile";
import { ProfilePage } from "@/components/ProfileUser";
import { ChangePasswordForm } from "@/components/ChangepwForm";
import MyBooking from "@/components/MyBooking";
import CancellationRequests from "@/components/CancellationRequests";
import CancellationRequestsProvider from "@/pages/admin/AdminCancellationRequests";
import { fetchUserProfile } from "@/services/userProfile.service";
import { useAuth } from "@/hooks/useAuth";

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
        console.log("Fetched user data:", userData);
        console.log("response:", response);
        setUserCurrent(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    console.log("Current user:", userCurrent);
  }, [userCurrent]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Navigate to provider cancellation requests page if needed
    if (tab === "provider-cancellation-requests") {
      navigate("/provider/cancellation-requests");
      return;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <p>📊 Đây là trang tổng quan tài khoản.</p>;
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
            <NavigationUser
              user={userCurrent!}
              activeTab={activeTab}
              onChangeTab={handleTabChange}
            />
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
