import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import {
  getRecentlyViewedTours,
  type RecentlyViewedTour,
} from "../services/recentlyViewedTours.service";

interface RecentlyViewedToursProps {
  /** Maximum number of tours to display */
  maxItems?: number;
  /** Custom CSS classes */
  className?: string;
  /** Title of the component */
  title?: string;
  /** Show in horizontal layout */
  horizontal?: boolean;
}

const RecentlyViewedTours: React.FC<RecentlyViewedToursProps> = ({
  maxItems = 5,
  className = "",
  title = "Đã xem gần đây",
  horizontal = false,
}) => {
  const [recentTours, setRecentTours] = useState<RecentlyViewedTour[]>([]);

  // Load recently viewed tours
  const loadRecentTours = () => {
    const tours = getRecentlyViewedTours();
    setRecentTours(tours.slice(0, maxItems));
  };

  // Load tours on component mount and listen for updates
  useEffect(() => {
    loadRecentTours();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "recently_viewed_tours") {
        loadRecentTours();
      }
    };

    // Listen for custom events from same window
    const handleCustomUpdate = () => {
      loadRecentTours();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("recentlyViewedUpdated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("recentlyViewedUpdated", handleCustomUpdate);
    };
  }, [maxItems]);

  // Format price
  const formatPrice = (price: number, discountedPrice?: number) => {
    const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

    if (discountedPrice && discountedPrice < price) {
      return (
        <div className="space-y-1">
          <span className="text-red-500 font-bold text-sm">{formatNumber(discountedPrice)}đ</span>
          <span className="text-gray-400 line-through text-xs block">{formatNumber(price)}đ</span>
        </div>
      );
    }

    return <span className="text-red-500 font-bold text-sm">{formatNumber(price)}đ</span>;
  };

  // Don't render if no tours
  if (recentTours.length === 0) {
    return null;
  }

  // Horizontal layout for tour detail page
  if (horizontal) {
    return (
      <div className={`w-full max-w-7xl mx-auto ${className}`}>
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {recentTours.map((tour) => (
            <Link
              key={tour.id}
              to={`/tour/${tour.slug}`}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={tour.poster_url || "/VieTour-Logo.png"}
                  alt={tour.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avatar-default.jpg";
                  }}
                />
              </div>

              <div className="p-5">
                <h4 className="font-medium text-gray-900 text-base leading-tight mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 h-12">
                  {tour.title}
                </h4>

                <div className="space-y-3">
                  <div>
                    {formatPrice(tour.price, tour.discountedPrice)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {tour.duration}
                    </div>

                    {tour.tour_category && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="max-w-20 truncate">{tour.tour_category.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
      </div>

      {/* Tours List */}
      <div className="divide-y divide-gray-50">
        {recentTours.map((tour, index) => (
          <Link
            key={tour.id}
            to={`/tour/${tour.slug}`}
            className="block p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                <img
                  src={tour.poster_url}
                  alt={tour.title}
                  className="w-14 h-14 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avatar-default.jpg";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {tour.title}
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    {formatPrice(tour.price, tour.discountedPrice)}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {tour.duration}
                    </div>

                    {/* Removed destination display here */}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedTours;
