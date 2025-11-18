import React from 'react';
import { X, User as UserIcon, Building2 } from 'lucide-react';
import { type User, type Provider } from '@/services/adminManager.service';

interface AccountDetailModalProps {
  isOpen: boolean;
  account: User | Provider | null;
  accountType: 'user' | 'provider';
  onClose: () => void;
  formatDate: (dateString: string) => string;
}

const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  account,
  accountType,
  onClose,
  formatDate,
}) => {
  if (!isOpen || !account) return null;

  const isUser = accountType === 'user';
  const user = isUser ? (account as User) : null;
  const provider = !isUser ? (account as Provider) : null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[100] bg-black/30"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {isUser ? (
              <UserIcon className="w-6 h-6 text-gray-700" />
            ) : (
              <Building2 className="w-6 h-6 text-gray-700" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {isUser ? 'Thông tin người dùng' : 'Thông tin nhà cung cấp'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar và tên */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            {account.avatar && account.avatar.trim() ? (
              <img
                src={account.avatar}
                alt={isUser ? `${user?.first_name} ${user?.last_name}` : provider?.company_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = isUser ? '/avatar-default.jpg' : '/company.png';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                {isUser ? (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-400" />
                )}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isUser 
                  ? `${user?.first_name} ${user?.last_name}`
                  : provider?.company_name
                }
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                ID: #{account.id}
              </p>
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-sm text-gray-900 mt-1">{account.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Số điện thoại</label>
                <p className="text-sm text-gray-900 mt-1">
                  {account.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </p>
              </div>
              {account.account_id && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Account ID</label>
                  <p className="text-sm text-gray-900 mt-1">#{account.account_id}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Ngày tạo</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(account.created_at)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Trạng thái</label>
                <p className="text-sm text-gray-900 mt-1">
                  {account.locked_until ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Đã khóa đến {formatDate(account.locked_until)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Hoạt động
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin riêng của Provider */}
          {!isUser && provider && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Thông tin công ty
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Mã số thuế</label>
                  <p className="text-sm text-gray-900 mt-1">{provider.tax_code}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Số giấy phép</label>
                  <p className="text-sm text-gray-900 mt-1">{provider.lisence_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Năm thành lập</label>
                  <p className="text-sm text-gray-900 mt-1">{provider.establish_year}</p>
                </div>
              </div>
              {provider.desc && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500 uppercase">Mô tả</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{provider.desc}</p>
                </div>
              )}
              {/* Địa chỉ Provider */}
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Địa chỉ</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {account.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Phường/Xã</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {account.ward || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Quận/Huyện</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {account.district || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Tỉnh/Thành phố</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {provider.provice || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin riêng của User */}
          {isUser && user && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Thông tin cá nhân
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Họ và tên</label>
                    <p className="text-sm text-gray-900 mt-1">{user.first_name} {user.last_name}</p>
                  </div>
                </div>
                {/* Địa chỉ User */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Địa chỉ</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {account.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Phường/Xã</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {account.ward || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Quận/Huyện</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {account.district || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Tỉnh/Thành phố</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {user.province || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailModal;

