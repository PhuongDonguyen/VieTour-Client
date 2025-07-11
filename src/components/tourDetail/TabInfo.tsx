import React from 'react';

interface TabInfoProps {
  id?: string | number;
  live_commentary?: string;
  duration?: string;
  transportation?: string;
  accommodation?: string;
}

const LABELS: Record<string, string> = {
  id: 'Mã tour',
  live_commentary: 'Tour diễn ra',
  duration: 'Độ dài tour',
  transportation: 'Phương tiện',
  accommodation: 'Nơi ở',
};

function renderValue(val?: string | number) {
  if (!val) return '-';
  const str = String(val);
  const isLong = str.length > 40;
  return (
    <span
      className={
        isLong
          ? 'inline-block max-w-[160px] md:max-w-[180px] truncate align-bottom cursor-pointer text-blue-700 text-lg font-semibold'
          : 'text-blue-700 text-lg font-semibold'
      }
      title={isLong ? str : undefined}
    >
      {str}
    </span>
  );
}

const TabInfo: React.FC<TabInfoProps> = ({ id, live_commentary, duration, transportation, accommodation }) => {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
        <div>
          <div className="text-sm text-gray-600 mb-1">{LABELS.id}</div>
          <div className="text-blue-700 text-2xl font-bold">{renderValue(id)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">{LABELS.live_commentary}</div>
          {renderValue(live_commentary)}
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">{LABELS.duration}</div>
          {renderValue(duration)}
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">{LABELS.transportation}</div>
          {renderValue(transportation)}
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">{LABELS.accommodation}</div>
          {renderValue(accommodation)}
        </div>
      </div>
    </div>
  );
};

export default TabInfo; 