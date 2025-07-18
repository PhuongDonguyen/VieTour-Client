import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/account.service';
import { useFormik } from 'formik';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onClose?: () => void;
  onSwitchForm?: () => void;
  onForgotPassword?: () => void;
}

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const LoginForm: React.FC<LoginFormProps> = ({ onClose, onSwitchForm, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const title = 'Chào mừng trở lại!';
  const subtitle = 'Đăng nhập để khám phá những chuyến đi tuyệt vời';
  const submitText = 'Đăng nhập';
  const switchText = 'Bạn chưa có tài khoản? Đăng ký ngay';

  const handleOAuthLogin = (provider: string) => {
    const loginUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/${provider}`;
    window.open(
      loginUrl,
      "_blank",
      "width=500,height=600,left=300,top=300"
    );
    if (onClose) onClose();
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate: values => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'Vui lòng nhập email';
      else if (!validateEmail(values.email)) errors.email = 'Email không hợp lệ';
      if (!values.password) errors.password = 'Vui lòng nhập mật khẩu';
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      setLoading(true);
      try {
        const user = await loginUser({ email: values.email, password: values.password });
        login(user); // Call login from useAuth with the user data
        setLoading(false);
        if (onClose) onClose();
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi.');
        setLoading(false);
      }
    },
  });

  return (
    <div className="p-4">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
      )}
      <h2 className="text-3xl font-bold text-orange-500 mb-2 text-center">{title}</h2>
      <p className="mb-6 text-gray-600 text-center">{subtitle}</p>
      {error && <div className="mb-4 text-red-500 text-start text-sm font-medium">{error}</div>}
      <form onSubmit={formik.handleSubmit} className="space-y-4 mb-6">
        <input
          name="email"
          type="text"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={loading}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="text-xs text-red-500">{formik.errors.email}</div>
        )}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <div className="text-xs text-red-500">{formik.errors.password}</div>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-orange-500 hover:underline focus:outline-none"
            onClick={onForgotPassword}
            disabled={loading}
          >
            Quên mật khẩu?
          </button>
        </div>
        <button
          type="submit"
          className={`w-full font-semibold py-3 rounded-lg transition-colors
            ${loading
              ? 'bg-orange-300 text-white opacity-60 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'}
          `}
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : submitText}
        </button>
      </form>
      <div className="flex items-center mb-6">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-4 text-gray-400 font-semibold">hoặc</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>
      <div className="space-y-3 mb-4">
        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-300 bg-white hover:bg-orange-50 font-semibold text-gray-700"
          disabled={loading}
        >
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">G</div>
          Đăng nhập với Google
        </button>
        <button
          onClick={() => handleOAuthLogin('facebooks')}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-300 bg-white hover:bg-blue-50 font-semibold text-gray-700"
          disabled={loading}
        >
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">f</div>
          Đăng nhập với Facebook
        </button>
      </div>
      {onSwitchForm && (
        <div className="text-center text-sm text-gray-600">
          <button
            onClick={onSwitchForm}
            className="text-orange-500 hover:underline font-medium"
            disabled={loading}
          >
            {switchText}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm; 