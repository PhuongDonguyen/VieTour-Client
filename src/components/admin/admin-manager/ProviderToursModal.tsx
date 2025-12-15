import React from 'react';
import { X, ImageOff, Loader2 } from 'lucide-react';
import type { Provider } from '@/services/adminManager.service';
import type { TourResponse } from '@/apis/tour.api';

interface ProviderToursModalProps {
  isOpen: boolean;
  provider: Provider | null;
  tours: TourResponse['data'];
  loading: boolean;
  pagination: TourResponse['pagination'] | null;
  currentPage: number;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

const ProviderToursModal: React.FC<ProviderToursModalProps> = ({
  isOpen,
  provider,
  tours,
  loading,
  pagination,
  currentPage,
  onClose,
  onPageChange,
}) => {
  if (!isOpen || !provider) return null;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const renderStatus = (isActive: boolean) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
    </span>
  );

  const normalizedLocation = (location?: string | null) => {
    if (!location) return 'Chưa cập nhật';
    const trimmed = location.trim();
    return trimmed.length > 0 ? trimmed : 'Chưa cập nhật';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Danh sách tour</h2>
            <p className="text-sm text-gray-600">
              Nhà cung cấp:{' '}
              <span className="font-medium text-gray-800">{provider.company_name}</span>
            </p>
            <p className="text-sm text-gray-500">
              Tổng tour:{' '}
              <span className="font-medium text-gray-700">
                {pagination?.totalItems ?? tours.length}
              </span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span>Đang tải danh sách tour...</span>
            </div>
          ) : tours.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
              <ImageOff className="h-10 w-10 text-gray-400" />
              <span>Nhà cung cấp chưa có tour nào.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 md:flex-row md:items-center"
                >
                  <div className="flex h-20 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 md:w-28">
                    {tour.poster_url ? (
                      <img
                        src={tour.poster_url}
                        alt={tour.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">#{tour.id}</span>
                      {renderStatus(Boolean(tour.is_active))}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{tour.title}</h3>
                    <p className="text-sm text-gray-600">
                      Địa điểm: <span className="font-medium">{normalizedLocation(tour.starting_point)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pagination && (pagination.hasPrevPage || pagination.hasNextPage) && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm">
            <span className="text-gray-600">
              Trang {currentPage} / {pagination.totalPages}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trang trước
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderToursModal;


