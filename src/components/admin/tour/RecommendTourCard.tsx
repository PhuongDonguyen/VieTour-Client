import React from "react";
import { MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecommendTourCardProps {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number | null;
  imageUrl: string;
  slug: string;
}

const RecommendTourCard: React.FC<RecommendTourCardProps> = ({
  id,
  title,
  location,
  duration,
  price,
  imageUrl,
  slug,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tour/${slug}`);
  };

  const formatPrice = (value: number | null) => {
    if (typeof value !== "number" || isNaN(value)) return "Liên hệ";
    return value.toLocaleString("vi-VN") + " VND";
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

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{location}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>{duration}</span>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-left">
            <div className="text-md font-bold text-blue-600">
              {formatPrice(price)}
            </div>
            {typeof price === "number" && !isNaN(price) && (
              <div className="text-sm text-gray-500">/ người</div>
            )}
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

export default RecommendTourCard;
