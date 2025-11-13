import React from 'react';

interface ProviderStatusProps {
  lockedUntil: string | null;
  formatDate: (dateString: string) => string;
}

const ProviderStatus: React.FC<ProviderStatusProps> = ({ lockedUntil, formatDate }) => {
  const lockDate = lockedUntil ? new Date(lockedUntil) : null;
  const now = new Date();
  const isLocked = lockDate && lockDate > now;

  if (isLocked) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Đã khóa
        </span>
        <span className="text-xs text-gray-500">
          Đến: {formatDate(lockedUntil!)}
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Hoạt động
    </span>
  );
};

export default ProviderStatus;

