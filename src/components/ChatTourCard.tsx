import React from "react";
import { FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

interface TourResult {
  title: string;
  duration: string;
  price: string;
  link: string;
  image: string;
}

interface ChatTourCardProps {
  tour: TourResult;
  onClick: (link: string) => void;
}

const ChatTourCard: React.FC<ChatTourCardProps> = ({ tour, onClick }) => {
  const formatPrice = (price: string) => {
    // Extract numeric value and format as VND
    const numericPrice = price.replace(/[^\d]/g, "");
    if (numericPrice) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(parseInt(numericPrice));
    }
    return price;
  };

  return (
    <div
      onClick={() => onClick(tour.link)}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
    >
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/VieTour-Logo.png"; // Fallback image
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {tour.title}
          </h4>
          <div className="mt-1 space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <FaCalendarAlt className="mr-1 flex-shrink-0" />
              <span className="truncate">{tour.duration}</span>
            </div>
            <div className="flex items-center text-xs text-green-600 font-semibold">
              <FaMoneyBillWave className="mr-1 flex-shrink-0" />
              <span>{formatPrice(tour.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTourCard;
