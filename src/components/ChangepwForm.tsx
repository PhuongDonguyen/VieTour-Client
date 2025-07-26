import React, { useState } from 'react';
import { changeUserPassword } from '@/services/userProfile.service';

export const ChangePasswordForm: React.FC = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('⚠️ Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      // Gọi API thực tế
      await changeUserPassword(passwords.current, passwords.new);
      alert('✅ Mật khẩu đã được thay đổi thành công!');

      setStatus('success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '❌ Đã xảy ra lỗi khi đổi mật khẩu!');
      setStatus('error');
    } finally {
      setLoading(false);
      setStatus('idle');
    }
  };

  const getButtonText = () => {
    if (loading) return 'Đang xử lý...';
    if (status === 'success') return 'Đổi mật khẩu thành công!';
    if (status === 'error') return 'Đổi mật khẩu thất bại';
    return 'Đổi mật khẩu';
  };

  const getButtonClass = () => {
    let base =
      'mt-6 px-8 py-3 rounded-lg font-medium uppercase tracking-wide transition-all duration-200 hover:-translate-y-1 hover:shadow-lg';

    if (loading) return `${base} bg-gray-400 cursor-not-allowed`;
    if (status === 'success') return `${base} bg-green-500 text-white`;
    if (status === 'error') return `${base} bg-red-500 text-white`;

    return `${base} bg-[#FF6B35] text-white hover:bg-[#FF6B35]/80`;
  };

  return (
    <div className="mb-12 mt-25 animate-fadeInUp">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF6B35] rounded-full"></span>
        Thay đổi mật khẩu
      </h2>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="space-y-6">
          {['current', 'new', 'confirm'].map(field => (
            <div className="space-y-2" key={field}>
              <label className="block text-sm font-medium text-gray-600 uppercase tracking-wide">
                {field === 'current'
                  ? 'Mật khẩu hiện tại'
                  : field === 'new'
                    ? 'Mật khẩu mới'
                    : 'Xác nhận mật khẩu mới'}
              </label>
              <input
                type="password"
                name={field}
                value={passwords[field as keyof typeof passwords]}
                onChange={handleChange}
                placeholder={
                  field === 'current'
                    ? 'Nhập mật khẩu hiện tại'
                    : field === 'new'
                      ? 'Nhập mật khẩu mới'
                      : 'Xác nhận mật khẩu mới'
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              />
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
