import React, { useEffect, useState } from "react";
import { fetchTours } from "../services/tour.service";
import SearchTourCard from "./SearchTourCard";
import { SkeletonMainTours } from "./Skeleton";

type TourCardData = {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  slug: string;
  viewCount: number;
  bookedCount: number;
};

const MainTours: React.FC = () => {
  const [tours, setTours] = useState<TourCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [existTourMore, setExistTourMore] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        const tourRes = await fetchTours({
          page: 1,
          limit: 8,
          is_active: true,
        });
        const toursData = tourRes.data;
        const pagination = tourRes.pagination;

        setPagination(pagination);

        setTours(
          toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            location: tour.starting_point || "Chưa cập nhật",
            duration: tour.duration ? `${tour.duration}` : "Chưa cập nhật",
            price: tour.price || 0,
            imageUrl: tour.poster_url,
            rating: tour.total_star / Math.max(tour.review_count, 1) || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
            viewCount: tour.view_count || 0,
            bookedCount: tour.booked_count || 0,
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi load tours:", err);
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  const handleMoreTours = async () => {
    if (pagination.hasNextPage) {
      try {
        setLoadingMore(true);
        const nextPage = pagination.page + 1;
        const tourRes = await fetchTours({
          page: nextPage,
          limit: 8,
          is_active: true,
        });
        const toursData = tourRes.data;
        const newPagination = tourRes.pagination;

        setPagination(newPagination);
        if (newPagination.hasNextPage === false) {
          setExistTourMore(false);
        }
        console.log("tour: ", toursData);
        setTours((prevTours) => [
          ...prevTours,
          ...toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            location: tour.starting_point || "Chưa cập nhật",
            duration: tour.duration ? `${tour.duration}` : "Chưa cập nhật",
            price: tour.price || 0,
            imageUrl: tour.poster_url,
            rating: tour.total_star / Math.max(tour.review_count, 1) || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
            viewCount: tour.view_count || 0,
            bookedCount: tour.booked_count || 0,
          })),
        ]);
        setLoadingMore(false);
      } catch (error) {
        console.error("Lỗi khi load thêm tour:", error);
        setLoadingMore(false);
      }
    }
  };

  if (loading) {
    return <SkeletonMainTours />;
  }

  return (
    <div className="bg-gradient-to-br bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#015294] mb-4">TOUR CHÍNH</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tours.map((tour) => (
            <SearchTourCard
              key={tour.id}
              id={tour.id}
              title={tour.title}
              location={tour.starting_point}
              duration={tour.duration}
              price={tour.price}
              imageUrl={tour.imageUrl}
              rating={tour.rating}
              reviewCount={tour.reviewCount}
              slug={tour.slug}
              viewCount={tour.viewCount}
              bookedCount={tour.bookedCount}
            />
          ))}
        </div>

        {existTourMore && (
          <div className="text-center mt-8">
            {loadingMore ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <button
                onClick={handleMoreTours}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Xem thêm tour khác
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainTours;
