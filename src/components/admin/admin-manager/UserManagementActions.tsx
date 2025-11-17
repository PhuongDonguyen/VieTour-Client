import React from 'react';
import { Search, X } from 'lucide-react';

interface UserManagementActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  isSearching: boolean;
  onClearSearch: () => void;
}

const UserManagementActions: React.FC<UserManagementActionsProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  isSearching,
  onClearSearch,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex-1 max-w-md">
        <div className="relative flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit();
            }}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={isSearching ? onClearSearch : onSearchSubmit}
              className="p-2 bg-black text-white rounded hover:bg-gray-800"
              title={isSearching ? 'Xóa bộ lọc tìm kiếm' : 'Tìm kiếm'}
            >
              {isSearching ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementActions;

