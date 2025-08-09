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
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tour/${slug}`);
  };

  const formatPrice = (price: number) => {
    if (typeof price !== "number" || isNaN(price)) return "0 VND";
    return price.toLocaleString("vi-VN") + " VND";
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
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

        {/* Location & Duration */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-3 min-h-[20px]">
          {reviewCount > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-600">
                {rating.toFixed(1)} ({reviewCount} đánh giá)
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Tour này chưa có đánh giá
            </div>
          )}
        </div>

        {/* Price and Button - Push to bottom */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
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
