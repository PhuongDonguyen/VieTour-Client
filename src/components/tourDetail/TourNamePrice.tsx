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
      <div className="max-w-7xl mx-auto mb-10 px-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-1/3"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse w-32"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-[#2195c4] mb-4 leading-tight">
        {title}
      </h1>
      <div className="text-2xl md:text-3xl font-semibold text-[#FF6B35] mb-6">
        Giá: {formatPrice(price)}
      </div>
      <button
        onClick={handleBookNow}
        className="bg-[#FF6B35] hover:bg-[#e65a28] text-white font-semibold px-6 py-3 rounded-xl transition duration-300 hover:shadow-lg"
      >
        ĐẶT NGAY
      </button>
    </div>
  );
};

export default TourNamePrice;
