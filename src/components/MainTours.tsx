import React, { useRef, useEffect, useState } from "react";
import { RatingStars } from "./RatingStarsProps";
import { fetchTours } from "../services/tour.service";
import { tourPriceService } from "../services/tourPrice.service";
import { Navigate, useNavigate } from "react-router-dom";
import { TourPrices } from "./TourPrices";
import { Star, MapPin, Clock, Users, Heart, Eye } from "lucide-react";
import { Loading } from "./Loading";

type TourCardProps = {
  id: number;
  title: string;
  price: string;
  imageUrl: string;
  totalStar: number;
  reviewCount: number;
  slug: string;
  duration: string;
  capacity: number;
  view: number;
};

const TourCard: React.FC<TourCardProps> = ({
  title = "Khám phá Vịnh Hạ Long - Thiên đường trên mặt nước",
  price = 500000,
  imageUrl = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
  totalStar = 4.5,
  reviewCount = 128,
  slug,
  duration = "3 ngày 2 đêm",
  capacity,
  view,
  // location = "Quảng Ninh",
  // maxGuests = 20,
  // discount = 15
}) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const navigate = useNavigate();
  const handleGoDetail = () => {
    navigate(`/tour/${slug}`);
    console.log(`Navigate to: /tour/${slug}`);
  };

  // const originalPrice = Math.round(parseInt(price.replace(/,/g, '')) / (1 - discount / 100));

  return (
    <div className="group relative w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
      {/* Discount Badge */}
      {/* {discount && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          -{discount}%
        </div>
      )} */}

      {/* Heart Icon */}
      {/* <button
        onClick={handleLike}
        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:bg-white hover:scale-110"
      >
        <Heart
          className={`w-5 h-5 transition-colors duration-300 ${
            isLiked ? 'text-red-500 fill-current' : 'text-gray-600'
          }`}
        />
      </button> */}

      {/* Image Container */}
      <div className="relative h-64 overflow-hidden" onClick={handleGoDetail}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-125"
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

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Location */}
        {/*         
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div> */}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 leading-tight min-h-[70px] line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <RatingStars totalStar={totalStar} reviewCount={reviewCount} />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* {discount && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString()}₫
              </span>
            )} */}
            <span className="text-2xl font-bold text-orange-600">
              {price.toLocaleString()}₫
            </span>
            <span className="text-sm text-gray-500 line-through">
              {price.toLocaleString()}₫
            </span>
          </div>
          {/* <p className="text-sm text-gray-600">/ người</p> */}
        </div>

        {/* Button */}
        <button
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          onClick={handleGoDetail}
        >
          <span className="flex items-center justify-center gap-2">
            ĐẶT TOUR NGAY
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
      <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-tl from-orange-100 to-transparent rounded-full opacity-50"></div>
    </div>
  );
};

const MainTours: React.FC = () => {
  const [tours, setTours] = useState<TourCardProps[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [existTourMore, setExistTourMore] = useState<boolean>(true);
  const  [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  useEffect(() => {
    console.log("Tour: ", tours);
  }, [tours]);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        const tourRes = await fetchTours(1, 6);
        const toursData = tourRes.data;
        const pagination = tourRes.pagination;

        setPagination(pagination);

        setTours(
          toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            price: tour.price,
            imageUrl: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
            duration: tour.duration,
            capacity: tour.capacity,
            view: tour.view_count,
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
        const nextPage = pagination.currentPage + 1;
        const tourRes = await fetchTours(nextPage, 6);
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
            price: tour.price,
            imageUrl: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            slug: tour.slug,
            duration: tour.duration,
            capacity: tour.capacity,
            view: tour.view_count,
          })),
        ]);
        setLoadingMore(false);
      } catch (error) {
        console.error("Lỗi khi load thêm tour:", error);
        setLoadingMore(false);
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
      {loading ? <Loading/> :(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <TourCard key={index} {...tour} />
          ))}
        </div>)}

        {existTourMore && (
          <div className="text-center mt-12">
            {loadingMore ? <Loading/>:(
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
