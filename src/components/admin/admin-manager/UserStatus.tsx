import React from 'react';

interface UserStatusProps {
  isBanned?: boolean;
}

const UserStatus: React.FC<UserStatusProps> = ({ isBanned }) => {
  if (isBanned) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Bị cấm
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Hoạt động
    </span>
  );
};

export default UserStatus;

