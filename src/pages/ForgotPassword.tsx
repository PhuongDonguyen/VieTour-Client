import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { updatePasswordUser, checkOtpStatusUser, checkEmailExists } from '../services/account.service';

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpStatus, setOtpStatus] = useState<{ success: boolean; otpVerifiedEmail: string } | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('isVerified')) {
      const checkOtp = async () => {
        try {
          setOtpStatus(await checkOtpStatusUser());
        } catch {
          setOtpStatus(null);
        }
      };
      checkOtp();
    }
  }, [location.search]);

  const emailFormik = useFormik({
    initialValues: { email: '' },
    validate: ({ email }) => {
      if (!email) return { email: 'Vui lòng nhập email' };
      if (!validateEmail(email)) return { email: 'Email không hợp lệ' };
      return {};
    },
    onSubmit: async ({ email }) => {
      setError('');
      setIsLoading(true);
      try {
        const res = await checkEmailExists(email);
        if (res.success) {
          navigate(`/verify/email?email=${encodeURIComponent(email)}`);
        } else {
          setError(res.message || 'Email không tồn tại.');
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi kiểm tra email.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate: ({ newPassword, confirmPassword }) => {
      const errors: Record<string, string> = {};
      if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới';
      else if (newPassword.length < 6) errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      if (!confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      else if (newPassword !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      return errors;
    },
    onSubmit: async ({ newPassword }) => {
      setIsLoading(true);
      setError('');
      try {
        await updatePasswordUser({ email: otpStatus?.otpVerifiedEmail || '', newPassword });
        setShowSuccess(true);
        setTimeout(() => navigate('/'), 1200);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100 p-4">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
        <h2 className="text-3xl font-bold text-orange-500 mb-6">Đặt lại mật khẩu</h2>
        {otpStatus?.success ? (
          <form onSubmit={passwordFormik.handleSubmit} className="w-full flex flex-col gap-4">
            <input
              name="newPassword"
              type="password"
              placeholder="Mật khẩu mới"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
              value={passwordFormik.values.newPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              disabled={isLoading || showSuccess}
            />
            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
              <div className="text-xs text-red-500">{passwordFormik.errors.newPassword}</div>
            )}
            <input
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
              value={passwordFormik.values.confirmPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              disabled={isLoading || showSuccess}
            />
            {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
              <div className="text-xs text-red-500">{passwordFormik.errors.confirmPassword}</div>
            )}
            {error && <div className="text-xs text-red-500 text-center">{error}</div>}
            {showSuccess && (
              <div className="flex justify-center">
                <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <div className="text-green-600 text-center font-semibold mb-2">Thay đổi mật khẩu thành công, đang chuyển hướng...</div>
              </div>
            )}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold mt-2 transition-colors
                ${(isLoading || showSuccess) ? 'bg-orange-300 text-white opacity-60 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              disabled={isLoading || showSuccess}
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </form>
        ) : (
          <form onSubmit={emailFormik.handleSubmit} className="w-full flex flex-col gap-4">
            <input
              name="email"
              type="text"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              onBlur={emailFormik.handleBlur}
              disabled={isLoading}
            />
            {emailFormik.touched.email && emailFormik.errors.email && (
              <div className="text-xs text-red-500">{emailFormik.errors.email}</div>
            )}
            {error && <div className="text-xs text-red-500 text-center">{error}</div>}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold mt-2 transition-colors
                ${isLoading ? 'bg-orange-300 text-white opacity-60 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Tiếp theo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;