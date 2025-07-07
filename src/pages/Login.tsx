import React from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

const handleOAuthLogin = (provider: string) => {
  // Placeholder for actual OAuth logic
  alert(`Login with ${provider}`);
};

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"
        alt="Travel background"
        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
      />
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
        <h2 className="text-3xl font-bold text-orange-500 mb-2">Chào mừng trở lại!</h2>
        <p className="mb-6 text-gray-600">Đăng nhập để khám phá những chuyến đi tuyệt vời</p>
        {/* Email/Password Form */}
        <form className="w-full flex flex-col gap-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            Đăng nhập
          </button>
        </form>
        {/* Divider */}
        <div className="flex items-center w-full mb-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-4 text-gray-400 font-semibold">hoặc</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        {/* OAuth Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-orange-50 font-semibold text-gray-700 shadow transition-colors"
          >
            <FcGoogle className="w-6 h-6" />
            Đăng nhập với Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('Facebook')}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-blue-50 font-semibold text-gray-700 shadow transition-colors"
          >
            <FaFacebook className="w-6 h-6 text-blue-600" />
            Đăng nhập với Facebook
          </button>
        </div>
        <div className="mt-6 text-gray-600 text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="text-orange-500 hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 