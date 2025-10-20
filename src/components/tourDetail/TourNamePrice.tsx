import React from "react";
import { useNavigate } from "react-router-dom";

type TourNamePriceProps = {
  title: string;
  price: string;
  tourSlug: string;
  loading?: boolean;
  location?: string;
  duration?: string;
  companyName?: string;
  totalStar?: number; // tổng số sao tích lũy
  reviewCount?: number; // total number of ratings
};

// Hàm format giá theo định dạng xxx.xxx.000 VND
const formatPrice = (price: string | number): string => {
  // Nếu price là string có chứa "VND", lấy số từ string
  let numericPrice: number;

  if (typeof price === "string") {
    // Loại bỏ "VND" và các ký tự không phải số
    const cleanPrice = price.replace(/[^\d]/g, "");
    numericPrice = parseInt(cleanPrice) || 0;
  } else {
    numericPrice = price;
  }

  // Format theo định dạng xxx.xxx.000 VND
  return numericPrice.toLocaleString("vi-VN") + " VND";
};

const TourNamePrice: React.FC<TourNamePriceProps> = ({
  title,
  price,
  tourSlug,
  loading = false,
  location,
  duration,
  companyName,
  totalStar,
  reviewCount,
}) => {
  const navigate = useNavigate();

  // Debug logging
  console.log("TourNamePrice props:", {
    title,
    location,
    duration,
    companyName,
    totalStar,
    reviewCount,
  });

  const ratingAverage =
    reviewCount && reviewCount > 0 ? (totalStar ?? 0) / reviewCount : 0;

  const handleBookNow = () => {
    navigate(`/booking/${tourSlug}`);
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 py-16 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-4 w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-6 w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 py-16 mb-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-orange-100/20"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full -translate-y-36 translate-x-36"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full translate-y-48 -translate-x-48"></div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              {companyName || "Tour du lịch chất lượng cao"}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>

            {/* Rating & reviews */}
            {(typeof totalStar === "number" ||
              typeof reviewCount === "number") && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const filled = (ratingAverage ?? 0) >= idx + 1;
                    const half =
                      (ratingAverage ?? 0) > idx &&
                      (ratingAverage ?? 0) < idx + 1;
                    return (
                      <svg
                        key={idx}
                        className={`w-5 h-5 ${
                          filled
                            ? "text-yellow-400"
                            : half
                            ? "text-yellow-300"
                            : "text-gray-300"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">
                    {(ratingAverage ?? 0).toFixed(1)}/5
                  </span>
                  <span className="mx-2">·</span>
                  <span>{reviewCount ?? 0} đánh giá</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-600 font-medium">
                  Thời gian: {duration || "3 ngày 2 đêm"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-600 font-medium">
                  {location || "Điểm đến hấp dẫn"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-2">Giá chỉ từ</div>
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
                  {formatPrice(price)}
                </div>
                <div className="text-sm text-gray-500">/người</div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  ĐẶT NGAY
                </div>
              </button>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Đảm bảo chất lượng 100%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourNamePrice;
