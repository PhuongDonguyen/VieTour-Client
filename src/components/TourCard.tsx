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
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm mx-auto">
      {/* Image Section */}
      <div className="relative overflow-hidden group" onClick={handleGoDetail}>
        <img
          src={image}
          alt={title}
          className="w-full h-100 object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-120 cursor-pointer"
        />

        {/* Discount Badge */}
        <div className="absolute top-2 right-2 bg-orange-400 text-white px-2 py-1 rounded-md text-sm font-medium">
          Giá hôm nay: -{discount}%
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg min-h-16 font-semibold text-gray-800 mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Giá gốc:</span>
            <span className="text-lg font-bold text-gray-800">
              {formatPrice(originalPrice)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Còn:</span>
            <span className="text-lg font-bold text-red-600">
              {formatPrice(discountedPrice)}
            </span>
          </div>
        </div>

        {/* Book Tour Button */}
        <button
          onClick={handleGoDetail}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 mb-4 cursor-pointer"
        >
          ĐẶT TOUR
        </button>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-blue-500">Đặt vé quan tâm:</span>
          </div>
          <div className="flex items-center gap-4 ms-10">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500">{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500">{comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500">{participants}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};