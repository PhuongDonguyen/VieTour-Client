import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Pagination } from '@/services/adminManager.service';

interface UserPaginationProps {
  pagination: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  filteredUsersCount: number;
}

const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 7) {
    // Hiển thị tất cả pages nếu <= 7
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Luôn hiển thị page đầu
    pages.push(1);
    
    if (currentPage <= 4) {
      // Gần đầu: 1, 2, 3, 4, 5, ..., totalPages
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Gần cuối: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
      pages.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Ở giữa: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
      pages.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }
  }
  
  return pages;
};

const UserPagination: React.FC<UserPaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
  filteredUsersCount,
}) => {
  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Hiển thị <span className="font-medium">{filteredUsersCount}</span> trong tổng số{' '}
        <span className="font-medium">{pagination.totalItems}</span> user
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!pagination.hasPrevPage}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {getPageNumbers(currentPage, pagination.totalPages).map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
                ...
              </span>
            );
          }
          const pageNumber = page as number;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pageNumber === currentPage
                  ? 'bg-black text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UserPagination;

