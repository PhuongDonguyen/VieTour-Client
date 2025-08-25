import React from "react";
import { MapPin, Eye, Star, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchTourCardProps {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  slug: string;
  viewCount?: number;
  bookedCount?: number;
}

export const SearchTourCard: React.FC<SearchTourCardProps> = ({
  id,
  title,
  location,
  duration,
  price,
  imageUrl,
  rating,
  reviewCount,
  slug,
  viewCount = 0,
  bookedCount = 0,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tour/${slug}`);
  };

  const formatPrice = (price: number) => {
    if (typeof price !== "number" || isNaN(price)) return "0 VND";
    return price.toLocaleString("vi-VN") + " VND";
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group h-full flex flex-col"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl || "/placeholder-tour.jpg"}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-tour.jpg";
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Location & Rating */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location}</span>
          </div>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4" />
          <span>{duration}</span>
        </div>

        {/* Stats - View & Booking Count */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{viewCount} lượt xem</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{bookedCount} lượt đặt</span>
          </div>
        </div>

        {/* Rating Details */}
        <div className="mb-3 min-h-[20px]">
          {reviewCount > 0 ? (
            <div className="text-sm text-gray-600">{reviewCount} đánh giá</div>
          ) : (
            <div className="text-sm text-gray-500">
              Tour chưa có đánh giá
            </div>
          )}
        </div>

        {/* Price and Button - Push to bottom */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-left">
            <div className="text-md font-bold text-blue-600">
              {formatPrice(price)}
            </div>
            <div className="text-sm text-gray-500">/ người</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchTourCard;
