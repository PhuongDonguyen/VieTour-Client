import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type User, type Provider } from '@/services/adminManager.service';

interface LockAccountModalProps {
  isOpen: boolean;
  account: User | Provider | null;
  accountType: 'user' | 'provider';
  onClose: () => void;
  onConfirm: (accountId: number, lockedUntil: string) => void;
  loading?: boolean;
}

const LockAccountModal: React.FC<LockAccountModalProps> = ({
  isOpen,
  account,
  accountType,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [lockDuration, setLockDuration] = useState('7'); // days
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('00:00');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLockDuration('7');
      setCustomDate('');
      setCustomTime('00:00');
    }
  }, [isOpen]);

  if (!isOpen || !account) return null;

  const getAccountName = () => {
    if (accountType === 'user') {
      const user = account as User;
      return `${user.first_name} ${user.last_name}`;
    } else {
      const provider = account as Provider;
      return provider.company_name;
    }
  };

  const getAccountId = () => {
    if (accountType === 'user') {
      const user = account as User;
      return user.account_id || user.id; // Use account_id if available, otherwise use id
    } else {
      return (account as Provider).account_id;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let lockedUntilDate: string;
    
    if (lockDuration === 'custom') {
      if (!customDate) {
        alert('Vui lòng chọn ngày khóa');
        return;
      }
      // Combine date and time
      const dateTimeString = `${customDate}T${customTime}:00`;
      lockedUntilDate = new Date(dateTimeString).toISOString();
    } else {
      const days = parseInt(lockDuration);
      const date = new Date();
      date.setDate(date.getDate() + days);
      lockedUntilDate = date.toISOString();
    }

    onConfirm(getAccountId(), lockedUntilDate);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Khóa tài khoản
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Bạn đang khóa tài khoản của <span className="font-medium text-gray-900">{getAccountName()}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian khóa
              </label>
              <select
                value={lockDuration}
                onChange={(e) => setLockDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={loading}
              >
                <option value="7">7 ngày</option>
                <option value="30">30 ngày</option>
                <option value="90">90 ngày</option>
                <option value="365">1 năm</option>
                <option value="custom">Tùy chọn</option>
              </select>
            </div>

            {lockDuration === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày mở khóa
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn giờ mở khóa
                  </label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Khóa tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockAccountModal;

