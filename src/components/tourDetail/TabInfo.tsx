import React from "react";
import { Clock, Bus, Hotel, MapPin, Info } from "lucide-react";

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
    },
    {
      key: "live_commentary",
      label: "Hình thức",
      value: live_commentary,
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      key: "duration",
      label: "Thời gian",
      value: duration,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      key: "transportation",
      label: "Phương tiện",
      value: transportation,
      icon: <Bus className="w-5 h-5" />,
    },
    {
      key: "accommodation",
      label: "Khách sạn",
      value: accommodation,
      icon: <Hotel className="w-5 h-5" />,
    },
  ];

  const renderValue = (value?: string | number) => {
    if (!value)
      return <span className="text-gray-400">Chưa cập nhật</span>;
    return <span className="text-gray-900">{String(value)}</span>;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {infoItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start gap-3 pb-4 border-b border-gray-100"
          >
            <div className="text-gray-400 mt-0.5">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 mb-1">
                {item.label}
              </div>
              <div className="font-medium text-base break-words">
                {renderValue(item.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabInfo;
