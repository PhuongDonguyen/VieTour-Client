import React from "react";
import { MapPin, Eye, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface TourCardProps {
  id: string;
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  views: string;
  comments: string;
  participants: string;
  slug: string;
  onBookTour?: (id: string) => void;
}

export const TourCard: React.FC<TourCardProps> = ({
  id,
  title,
  image,
  originalPrice,
  discountedPrice,
  discount,
  views,
  comments,
  participants,
  slug,
  onBookTour,
}) => {
  const handleBookTour = () => {
    if (onBookTour) {
      onBookTour(id);
    }
  };
  const navigate = useNavigate();
  const handleGoDetail = () => {
    navigate(`/tour/${slug}`);
  };


  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "VNĐ";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full h-full">
      {/* Image Section */}
      <div className="relative overflow-hidden group" onClick={handleGoDetail}>
        <img
          src={image}
          alt={title}
          className="w-full h-80 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110 cursor-pointer"
        />

        {/* Discount Badge */}
        <div className="absolute top-2 right-2 bg-orange-400 text-white px-2 py-1 rounded-md text-sm font-medium">
          Giá hôm nay: -{discount}%
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-sm min-h-12 font-semibold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Pricing */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Giá gốc:</span>
            <span className="text-sm font-bold text-gray-800 line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Còn:</span>
            <span className="text-base font-bold text-red-600">
              {formatPrice(discountedPrice)}
            </span>
          </div>
        </div>

        {/* Book Tour Button */}
        <button
          onClick={handleGoDetail}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-2 rounded-md transition-colors duration-200 mb-3 cursor-pointer text-sm"
        >
          ĐẶT TOUR
        </button>

        {/* Stats */}
        <div className="flex flex-col gap-1 text-sm text-gray-600 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-blue-500 text-xs">Đặt vé quan tâm:</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-blue-500 text-xs">{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-blue-500 text-xs">{comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-blue-500 text-xs">{participants}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};