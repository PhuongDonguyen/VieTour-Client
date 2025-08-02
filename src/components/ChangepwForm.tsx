import React, { useState, useEffect } from "react";
import { changeUserPassword } from "@/services/userProfile.service";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AccountPageSkeleton } from "./AccountSkeleton";

export const ChangePasswordForm: React.FC = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    // Simulate initialization time
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("⚠️ Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      await changeUserPassword(passwords.current, passwords.new);
      alert("✅ Mật khẩu đã được thay đổi thành công!");

      setStatus("success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "❌ Đã xảy ra lỗi khi đổi mật khẩu!"
      );
      setStatus("error");
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  };

  const getButtonText = () => {
    if (loading) return "Đang xử lý...";
    if (status === "success") return "Đổi mật khẩu thành công!";
    if (status === "error") return "Đổi mật khẩu thất bại";
    return "Đổi mật khẩu";
  };

  const getButtonClass = () => {
    let base =
      "mt-5 w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    if (loading)
      return `${base} bg-gray-400 cursor-not-allowed focus:ring-gray-400`;
    if (status === "success")
      return `${base} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`;
    if (status === "error")
      return `${base} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;

    return `${base} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
  };

  if (initializing) {
    return <AccountPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Bảo mật</h2>
        <p className="text-gray-600 text-sm">
          Thay đổi mật khẩu và bảo mật tài khoản
        </p>
      </div>

      {/* Security Info Card */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-blue-800">
              Bảo mật tài khoản
            </div>
            <div className="text-xs text-blue-600">
              Đảm bảo mật khẩu của bạn an toàn và khó đoán
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {[
            {
              field: "current",
              label: "Mật khẩu hiện tại",
              placeholder: "Nhập mật khẩu hiện tại",
            },
            {
              field: "new",
              label: "Mật khẩu mới",
              placeholder: "Nhập mật khẩu mới",
            },
            {
              field: "confirm",
              label: "Xác nhận mật khẩu mới",
              placeholder: "Xác nhận mật khẩu mới",
            },
          ].map(({ field, label, placeholder }) => (
            <div key={field} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <div className="relative">
                <input
                  type={
                    showPasswords[field as keyof typeof showPasswords]
                      ? "text"
                      : "password"
                  }
                  name={
                    field === "current"
                      ? "currentPassword"
                      : `newPassword_${field}`
                  }
                  autoComplete={
                    field === "current" ? "current-password" : "new-password"
                  }
                  value={passwords[field as keyof typeof passwords]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />

                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility(
                      field as keyof typeof showPasswords
                    )
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords[field as keyof typeof showPasswords] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={getButtonClass()}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};
