import React from "react";
import { useNavigate } from "react-router-dom";

type TourNamePriceProps = {
  title: string;
  price: string;
  tourSlug: string;
  loading?: boolean;
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
}) => {
  const navigate = useNavigate();

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
              Tour du lịch chất lượng cao
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>

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
                  Thời gian: 3 ngày 2 đêm
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
                  Điểm đến hấp dẫn
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
