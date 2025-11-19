import React from 'react';
import { type User } from '@/services/adminManager.service';
import UserStatus from './UserStatus';
import UserActionsMenu from './UserActionsMenu';

interface UserTableProps {
  users: User[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onToggleBan: (user: User) => void;
  onViewDetail: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, formatDate, onToggleBan, onViewDetail }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Họ và Tên
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Số điện thoại
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Địa chỉ
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewDetail(user)}
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  #{user.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar && user.avatar.trim() ? (
                      <img
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/avatar-default.jpg';
                        }}
                      />
                    ) : (
                      <img
                        src="/avatar-default.jpg"
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.address ? (
                    <div className="max-w-xs truncate">
                      {user.address}
                      {user.ward && `, ${user.ward}`}
                      {user.district && `, ${user.district}`}
                      {user.province && `, ${user.province}`}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Chưa cập nhật</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <UserStatus isBanned={user.is_banned} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <UserActionsMenu user={user} onToggleBan={onToggleBan} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

