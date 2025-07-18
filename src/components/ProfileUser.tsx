import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
// Types
interface FormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: "female" | "male" | "other";
  address: string;
}

interface Passwords {
  current: string;
  new: string;
  confirm: string;
}

interface ButtonState {
  loading: boolean;
  success: boolean;
}

interface ButtonStates {
  updateInfo: ButtonState;
  changePassword: ButtonState;
}

interface Tour {
  id: string;
  name: string;
  date: string;
  people: string;
  price: string;
  status: "completed" | "upcoming" | "cancelled";
  statusText: string;
  statusColor: string;
}

type PasswordField = keyof Passwords;
type FormField = keyof FormData;

export const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "Nguyễn Thị Linh",
    email: "linh.nguyen@example.com",
    phone: "+84 123 456 789",
    birthDate: "1995-05-15",
    gender: "female",
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  });

  const [passwords, setPasswords] = useState<Passwords>({
    current: "",
    new: "",
    confirm: "",
  });

  const [buttonStates, setButtonStates] = useState<ButtonStates>({
    updateInfo: { loading: false, success: false },
    changePassword: { loading: false, success: false },
  });

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  // Parallax effect
  useEffect(() => {
    const handleScroll = (): void => {
      setScrollOffset(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as FormField]: value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name as PasswordField]: value,
    }));
  };

  const updateButtonState = (
    buttonType: keyof ButtonStates,
    newState: Partial<ButtonState>
  ): void => {
    setButtonStates((prev) => ({
      ...prev,
      [buttonType]: { ...prev[buttonType], ...newState },
    }));
  };

  const handleUpdateInfo = async (): Promise<void> => {
    updateButtonState("updateInfo", { loading: true, success: false });

    // Simulate API call
    setTimeout(() => {
      updateButtonState("updateInfo", { loading: false, success: true });

      setTimeout(() => {
        updateButtonState("updateInfo", { loading: false, success: false });
      }, 2000);
    }, 1000);
  };

  const validatePasswords = (): boolean => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return false;
    }

    return true;
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!validatePasswords()) return;

    updateButtonState("changePassword", { loading: true, success: false });

    // Simulate API call
    setTimeout(() => {
      updateButtonState("changePassword", { loading: false, success: true });

      // Clear form
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      setTimeout(() => {
        updateButtonState("changePassword", { loading: false, success: false });
      }, 2000);
    }, 1000);
  };

  const tours: Tour[] = [
    {
      id: "TL2024001",
      name: "Tour Hạ Long Bay - Sapa 5N4Đ",
      date: "15/12/2024 - 20/12/2024",
      people: "2 người",
      price: "12.500.000 VNĐ",
      status: "completed",
      statusText: "Đã hoàn thành",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "TL2025002",
      name: "Tour Phú Quốc 3N2Đ",
      date: "25/07/2025 - 28/07/2025",
      people: "4 người",
      price: "8.900.000 VNĐ",
      status: "upcoming",
      statusText: "Sắp diễn ra",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "TL2025003",
      name: "Tour Đà Lạt 2N1Đ",
      date: "10/06/2025 - 12/06/2025",
      people: "2 người",
      price: "3.200.000 VNĐ",
      status: "cancelled",
      statusText: "Đã hủy",
      statusColor: "bg-red-100 text-red-800",
    },
  ];

  const getButtonClasses = (
    buttonState: ButtonState,
    baseClasses: string
  ): string => {
    const stateClasses = buttonState.success
      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white";

    const loadingClasses = buttonState.loading ? "scale-95" : "";

    return `${baseClasses} ${stateClasses} ${loadingClasses}`;
  };

  const getButtonText = (
    buttonState: ButtonState,
    loadingText: string,
    successText: string,
    defaultText: string
  ): string => {
    if (buttonState.loading) return loadingText;
    if (buttonState.success) return successText;
    return defaultText;
  };

  return (
    <div className="bg-gradient-to-br bg-white min-h-screen p-5 mt-18">
      <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-10 text-center relative overflow-hidden"
          style={{ transform: `translateY(${scrollOffset * -0.5}px)` }}
        >
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full animate-spin"
            style={{ animationDuration: "20s" }}
          >
            <div className="w-full h-full bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-110 hover:rotate-6">
              <img
                src="data:image/jpeg;base64,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"
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-light text-white mb-2">
              {formData.name}
            </h1>
            <p className="text-xl text-white/90">Thành viên từ 2022</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          {/* Thông tin cá nhân */}
          <div
            className="mb-12 opacity-0 animate-pulse"
            style={{ animation: "fadeInUp 0.6s ease forwards 0.2s" }}
          >
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Thông tin cá nhân
            </h2>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="tel"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Ngày sinh
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  >
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Địa chỉ
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateInfo}
                disabled={buttonStates.updateInfo.loading}
                className={getButtonClasses(
                  buttonStates.updateInfo,
                  "px-8 py-3 rounded-lg font-medium uppercase tracking-wide transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                )}
              >
                {getButtonText(
                  buttonStates.updateInfo,
                  "Đang cập nhật...",
                  "Cập nhật thành công!",
                  "Cập nhật thông tin"
                )}
              </button>
            </div>
          </div>

          {/* Thay đổi mật khẩu */}
          <div
            className="mb-12 opacity-0 animate-pulse"
            style={{ animation: "fadeInUp 0.6s ease forwards 0.4s" }}
          >
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Thay đổi mật khẩu
            </h2>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={buttonStates.changePassword.loading}
                className={getButtonClasses(
                  buttonStates.changePassword,
                  "mt-6 px-8 py-3 rounded-lg font-medium uppercase tracking-wide transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                )}
              >
                {getButtonText(
                  buttonStates.changePassword,
                  "Đang xử lý...",
                  "Đổi mật khẩu thành công!",
                  "Đổi mật khẩu"
                )}
              </button>
            </div>
          </div>

          {/* Lịch sử đặt tour */}
          <div
            className="opacity-0 animate-pulse"
            style={{ animation: "fadeInUp 0.6s ease forwards 0.6s" }}
          >
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Lịch sử đặt tour
            </h2>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {tours.map((tour: Tour, index: number) => (
                <div
                  key={tour.id}
                  className={`p-8 hover:bg-gray-50 transition-all duration-200 hover:translate-x-2 relative group ${
                    index < tours.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">
                      {tour.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide ${tour.statusColor}`}
                    >
                      {tour.statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <span>{tour.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👥</span>
                      <span>{tour.people}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💰</span>
                      <span>{tour.price}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🆔</span>
                      <span>{tour.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fadeInUp {
        animation: fadeInUp 0.5s ease-out;
      }
    `,
        }}
      />
    </div>
  );
};
