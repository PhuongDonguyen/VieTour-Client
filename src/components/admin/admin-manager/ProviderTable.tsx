import React, { useState } from 'react';
import { type Provider } from '@/services/adminManager.service';
import ProviderStatus from './ProviderStatus';
import ProviderActionsMenu from './ProviderActionsMenu';

interface ProviderTableProps {
  providers: Provider[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onToggleBan: (provider: Provider) => void;
  onViewProviderTours: (provider: Provider) => void;
  onViewDetail: (provider: Provider) => void;
}

const ProviderAvatar: React.FC<{ avatar: string; companyName: string }> = ({ avatar, companyName }) => {
  const [imageError, setImageError] = useState(false);
  
  // Nếu avatar không có hoặc rỗng, hoặc ảnh bị lỗi, dùng ảnh mặc định
  const avatarSrc = (avatar && avatar.trim() && !imageError) ? avatar : '/company.png';

  return (
    <img
      src={avatarSrc}
      alt={companyName || 'Company'}
      className="w-10 h-10 rounded-full object-cover"
      onError={() => {
        // Nếu ảnh mặc định cũng lỗi, không làm gì thêm (tránh loop)
        if (avatarSrc === '/company.png') {
          return;
        }
        setImageError(true);
      }}
    />
  );
};

const ProviderTable: React.FC<ProviderTableProps> = ({ providers, loading, formatDate, onToggleBan, onViewProviderTours, onViewDetail }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tên công ty
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
              Mã số thuế
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
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : providers.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            providers.map((provider) => (
              <tr 
                key={provider.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewDetail(provider)}
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  #{provider.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ProviderAvatar 
                      avatar={provider.avatar} 
                      companyName={provider.company_name || 'Company'} 
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {provider.company_name || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {provider.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {provider.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="max-w-xs truncate">
                    {provider.address}
                    {provider.ward && `, ${provider.ward}`}
                    {provider.district && `, ${provider.district}`}
                    {provider.provice && `, ${provider.provice}`}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {provider.tax_code}
                </td>
                <td className="px-6 py-4">
                  <ProviderStatus isBanned={provider.is_banned} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(provider.created_at)}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <ProviderActionsMenu provider={provider} onToggleBan={onToggleBan} onViewTours={onViewProviderTours} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderTable;

