import React from "react";
import { Calendar, Clock, Bus, Hotel, MapPin, Info } from "lucide-react";

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
  accommodation,
}) => {
  const infoItems: InfoItem[] = [
    {
      key: "id",
      label: "Mã tour",
      value: id,
      icon: <Info className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "live_commentary",
      label: "Tour diễn ra",
      value: live_commentary,
      icon: <MapPin className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "duration",
      label: "Độ dài tour",
      value: duration,
      icon: <Clock className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      key: "transportation",
      label: "Phương tiện",
      value: transportation,
      icon: <Bus className="w-5 h-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      key: "accommodation",
      label: "Nơi ở",
      value: accommodation,
      icon: <Hotel className="w-5 h-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const renderValue = (value?: string | number) => {
    if (!value)
      return <span className="text-gray-400 italic">Chưa có thông tin</span>;

    const str = String(value);
    const isLong = str.length > 30;

    return (
      <span
        className={`font-semibold ${isLong ? "text-sm" : "text-base"}`}
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
              <div
                className={`${item.color} p-3 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow`}
              >
                {item.icon}
              </div>

              {/* Label */}
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {item.label}
              </div>

              {/* Value */}
              <div
                className={`${item.color} min-h-[24px] flex items-center justify-center`}
              >
                {renderValue(item.value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="mt-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-blue-100 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lưu ý quan trọng
          </h3>
          <p className="text-gray-600 text-lg">
            Vui lòng đọc kỹ thông tin trước khi đặt tour để có trải nghiệm tốt
            nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-xl font-bold">✓</span>
              </div>
              <h4 className="font-bold text-gray-800 text-lg">
                Điều kiện đặt tour
              </h4>
            </div>
            <ul className="text-gray-600 space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  Đặt tour trước ít nhất{" "}
                  <strong className="text-blue-600">2 ngày</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  Thanh toán <strong className="text-blue-600">100%</strong>{" "}
                  trước khi khởi hành
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>
                  Hoàn tiền theo{" "}
                  <strong className="text-blue-600">quy định</strong> của công
                  ty
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl font-bold">✓</span>
              </div>
              <h4 className="font-bold text-gray-800 text-lg">
                Dịch vụ bao gồm
              </h4>
            </div>
            <ul className="text-gray-600 space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Vận chuyển theo lịch trình</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Ăn uống theo chương trình</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Hướng dẫn viên chuyên nghiệp</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Bảo hiểm du lịch cơ bản</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-orange-600 text-xl font-bold">⚠</span>
              </div>
              <h4 className="font-bold text-gray-800 text-lg">Lưu ý khác</h4>
            </div>
            <ul className="text-gray-600 space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Mang theo giấy tờ tùy thân</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Chuẩn bị trang phục phù hợp</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Liên hệ hỗ trợ khi cần thiết</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="text-lg">📞</span>
            <span className="font-semibold">Liên hệ tư vấn: 0966802503</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabInfo;
