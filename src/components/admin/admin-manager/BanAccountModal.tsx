import React from 'react';
import { X, Ban, ShieldCheck } from 'lucide-react';
import { type User, type Provider } from '@/services/adminManager.service';

interface BanAccountModalProps {
  isOpen: boolean;
  account: User | Provider | null;
  accountType: 'user' | 'provider';
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const BanAccountModal: React.FC<BanAccountModalProps> = ({
  isOpen,
  account,
  accountType,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !account) return null;

  const isBanned = Boolean(account.is_banned);
  const isUser = accountType === 'user';
  const displayName = isUser
    ? `${(account as User).first_name} ${(account as User).last_name}`.trim()
    : (account as Provider).company_name;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {isBanned ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Ban className="h-5 w-5 text-red-600" />
            )}
            {isBanned ? 'Gỡ cấm tài khoản' : 'Cấm tài khoản'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            {isBanned
              ? 'Bạn có chắc chắn muốn gỡ cấm tài khoản này? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống.'
              : 'Bạn có chắc chắn muốn cấm tài khoản này? Tài khoản sẽ không thể đăng nhập và sử dụng hệ thống cho đến khi được gỡ cấm.'}
          </p>

          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{displayName || 'Không rõ tên'}</p>
            <p className="text-xs text-gray-500 mt-1">ID tài khoản: #{account.account_id ?? account.id}</p>
            <p className="text-xs text-gray-500">
              Email: <span className="font-medium text-gray-700">{account.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Đang xử lý...' : isBanned ? 'Gỡ cấm' : 'Xác nhận cấm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanAccountModal;

