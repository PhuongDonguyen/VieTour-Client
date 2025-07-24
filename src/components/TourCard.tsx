import React from "react";
import { MapPin, Eye, MessageCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface TourCardProps {
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  views: string;
  comments: string;
  participants: string;
  slug: string;
}

const TourCard: React.FC<TourCardProps> = React.memo(({
  title,
  image,
  originalPrice,
  discountedPrice,
  discount,
  views,
  comments,
  participants,
  slug,
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm mx-auto">
    {/* Image Section */}
    <Link to={`/tour/${slug}`} className="relative overflow-hidden group block">
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="w-full h-100 object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
      />
      {/* Discount Badge */}
      <div className="absolute top-2 right-2 bg-orange-400 text-white px-2 py-1 rounded-md text-sm font-medium">
        Giá hôm nay: -{discount}%
      </div>
    </Link>

    {/* Content Section */}
    <div className="p-4">
      {/* Title */}
      <Link to={`/tour/${slug}`} className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 block hover:text-orange-500 transition-colors">
        {title}
      </Link>

      {/* Pricing */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Giá gốc:</span>
          <span className="text-lg font-bold text-gray-800">
            {originalPrice.toLocaleString("vi-VN")}VNĐ
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Còn:</span>
          <span className="text-lg font-bold text-red-600">
            {discountedPrice.toLocaleString("vi-VN")}VNĐ
          </span>
        </div>
      </div>

      {/* Book Tour Button */}
      <Link
        to={`/tour/${slug}`}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 mb-4 cursor-pointer block text-center"
      >
        ĐẶT TOUR
      </Link>

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
));

export { TourCard };
