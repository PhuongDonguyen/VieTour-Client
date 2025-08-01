import React from 'react';
import { Calendar, Clock, Bus, Hotel, MapPin, Info } from 'lucide-react';

interface TabInfoProps {
  id?: string | number;
  live_commentary?: string;
  duration?: string;
  transportation?: string;
  accommodation?: string;
}

interface InfoItem {
  key: string;
  label: string;
  value?: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const TabInfo: React.FC<TabInfoProps> = ({ 
  id, 
  live_commentary, 
  duration, 
  transportation, 
  accommodation 
}) => {
  const infoItems: InfoItem[] = [
    {
      key: 'id',
      label: 'Mã tour',
      value: id,
      icon: <Info className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'live_commentary',
      label: 'Tour diễn ra',
      value: live_commentary,
      icon: <MapPin className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      key: 'duration',
      label: 'Độ dài tour',
      value: duration,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      key: 'transportation',
      label: 'Phương tiện',
      value: transportation,
      icon: <Bus className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      key: 'accommodation',
      label: 'Nơi ở',
      value: accommodation,
      icon: <Hotel className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const renderValue = (value?: string | number) => {
    if (!value) return <span className="text-gray-400 italic">Chưa có thông tin</span>;
    
    const str = String(value);
    const isLong = str.length > 30;
    
    return (
      <span
        className={`font-semibold ${isLong ? 'text-sm' : 'text-base'}`}
        title={isLong ? str : undefined}
      >
        {isLong ? `${str.substring(0, 30)}...` : str}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Thông tin tour
        </h2>
        <p className="text-gray-600 text-center">
          Tổng quan về chuyến du lịch của bạn
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {infoItems.map((item) => (
          <div
            key={item.key}
            className={`${item.bgColor} rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icon */}
              <div className={`${item.color} p-3 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow`}>
                {item.icon}
              </div>
              
              {/* Label */}
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {item.label}
              </div>
              
              {/* Value */}
              <div className={`${item.color} min-h-[24px] flex items-center justify-center`}>
                {renderValue(item.value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center mb-6">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Lưu ý quan trọng
          </h3>
          <p className="text-gray-600">
            Vui lòng đọc kỹ thông tin trước khi đặt tour
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">✓ Điều kiện đặt tour</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Đặt trước ít nhất 3 ngày</li>
              <li>• Thanh toán 50% trước khi khởi hành</li>
              <li>• Hủy tour trước 24h được hoàn 100%</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">✓ Dịch vụ bao gồm</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vận chuyển theo lịch trình</li>
              <li>• Ăn uống theo chương trình</li>
              <li>• Hướng dẫn viên chuyên nghiệp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabInfo; 