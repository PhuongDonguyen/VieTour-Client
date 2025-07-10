import React, { use, useEffect, useState } from "react";
import { RatingStars } from "./RatingStarsProps";
import { tourService } from "../services/tourService";
import { tourPriceService } from "../services/tourPriceService";
import { useNavigate } from "react-router-dom";

type TourCardProps = {
  id: number;
  title: string;
  price: string;
  imageUrl: string;
  totalStar: number;
  reviewCount: number;
  slug: string;
};

type TourPrice = {
  adultPrice: number;
  tourId: number;
};

const TourCard: React.FC<TourCardProps> = ({
  title,
  price,
  imageUrl,
  totalStar,
  reviewCount,
  slug,
}) => {
  const navigate = useNavigate();
  const handleGoDetail = () => {
    navigate(`/tour/${slug}`);
  };
  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* ✅ Hình ảnh với hiệu ứng zoom khi hover */}
      <div className="relative h-56 overflow-hidden group rounded-t-xl cursor-pointer" onClick={handleGoDetail}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition duration-300"></div>
      </div>

      {/* Nội dung card */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-800 leading-tight mb-2 min-h-[48px] line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Giá gốc: {" "}
          <span className="text-lg text-red-600 font-bold">{price}VND</span>
        </p>
        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          onClick={handleGoDetail}
        >
          ĐẶT TOUR
        </button>
      </div>
      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
        <RatingStars totalStar={totalStar} reviewCount={reviewCount} />
      </div>
    </div>
  );
};

const MainTours: React.FC = () => {
  const [tourPrices, setTourPrices] = useState<TourPrice[]>([]);
  const [tours, setTours] = useState<TourCardProps[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [existTourMore, setExistTourMore] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch tour prices trước
        const tourPriceRes = await tourPriceService.getAllTourPrices();
        const tourPricesData = tourPriceRes.data;
        const parsedPrices = tourPricesData.map((price: any) => ({
          adultPrice: price.adult_price,
          tourId: price.tour_id,
        }));
        setTourPrices(parsedPrices);

        // 2. Sau đó mới fetch tour
        const tourRes = await tourService.getTours(1, 6);
        const toursData = tourRes.data;
        const pagination = tourRes.pagination;

        console.log("Pagination data:", pagination);
        setPagination(pagination);
        setTours(
          toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            price:
              getMinAdultPriceByTourId(parsedPrices, tour.id)?.toString() ||
              "0",
            imageUrl: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
          }))
        );
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const getMinAdultPriceByTourId = (
    prices: TourPrice[],
    tourId: number
  ): number | null => {
    const filtered = prices.filter((t) => t.tourId === tourId);
    if (filtered.length === 0) return null;

    return Math.min(...filtered.map((t) => t.adultPrice));
  };

  const handleMoreTours = async () => {
    if (pagination.hasNextPage) {
      try {
        const nextPage = pagination.currentPage + 1;
        const tourRes = await tourService.getTours(nextPage, 6);
        const toursData = tourRes.data;
        const newPagination = tourRes.pagination;

        setPagination(newPagination);
        if (newPagination.hasNextPage === false) {
          setExistTourMore(false);
        }
        setTours((prevTours) => [
          ...prevTours,
          ...toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            price:
              getMinAdultPriceByTourId(tourPrices, tour.id)?.toString() || "0",
            imageUrl: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
          })),
        ]);
      } catch (error) {
        console.error("Lỗi khi load thêm tour:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">TOUR CHÍNH</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <TourCard key={index} {...tour} />
          ))}
        </div>

        {existTourMore && (
          <div className="text-center mt-12">
            <button onClick={handleMoreTours} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer">
              Xem thêm tour khác
            </button>
          </div>
        )}
      </div>
    </div>

  );
};

export default MainTours;
