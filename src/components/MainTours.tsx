import React, { useEffect, useState } from "react";
import { RatingStars } from "./RatingStarsProps";
import { fetchTours } from "../services/tour.service";
import { Link } from "react-router-dom";
import { Clock, Users, Eye } from "lucide-react";

// TourCardProps type
interface TourCardProps {
  title: string;
  price: number;
  imageUrl: string;
  totalStar: number;
  reviewCount: number;
  slug: string;
  duration: string;
  capacity: number;
  view: number;
}

const TourCard: React.FC<TourCardProps> = React.memo(({
  title,
  price,
  imageUrl,
  totalStar,
  reviewCount,
  slug,
  duration,
  capacity,
  view
}) => (
  <div className="group relative w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
    <Link to={`/tour/${slug}`}> {/* Entire card clickable */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Floating Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Tối đa {capacity} khách</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{view} view</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 leading-tight min-h-[56px] line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <RatingStars totalStar={totalStar} reviewCount={reviewCount} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-600">
              {price.toLocaleString()}₫
            </span>
          </div>
        </div>
        <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-center">
          ĐẶT TOUR NGAY
        </div>
      </div>
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
      <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-tl from-orange-100 to-transparent rounded-full opacity-50"></div>
    </Link>
  </div>
));

const MainTours: React.FC = () => {
  const [tours, setTours] = useState<TourCardProps[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [existTourMore, setExistTourMore] = useState<boolean>(true);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const tourRes = await fetchTours(1, 6);
        const toursData = tourRes.data;
        const pagination = tourRes.pagination;
        setPagination(pagination);
        setTours(
          toursData.map((tour: any) => ({
            title: tour.title,
            price: tour.price,
            imageUrl: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
            duration: tour.duration,
            capacity: tour.capacity,
            view: tour.view_count
          }))
        );
      } catch (err) {
        console.error("Lỗi khi load tours:", err);
      }
    };
    loadTours();
  }, []);

  const handleMoreTours = async () => {
    if (pagination.hasNextPage) {
      try {
        const nextPage = pagination.currentPage + 1;
        const tourRes = await fetchTours(nextPage, 6);
        const toursData = tourRes.data;
        const newPagination = tourRes.pagination;
        setPagination(newPagination);
        if (newPagination.hasNextPage === false) {
          setExistTourMore(false);
        }
        setTours((prevTours) => [
          ...prevTours,
          ...toursData.map((tour: any) => ({
            title: tour.title,
            price: tour.price,
            imageUrl: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
            duration: tour.duration,
            capacity: tour.capacity,
            view: tour.view_count
          })),
        ]);
      } catch (error) {
        console.error("Lỗi khi load thêm tour:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#015294] mb-4">TOUR CHÍNH</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <TourCard key={index} {...tour} />
          ))}
        </div>
        {existTourMore && (
          <div className="text-center mt-12">
            <button
              onClick={handleMoreTours}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer"
            >
              Xem thêm tour khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainTours;
