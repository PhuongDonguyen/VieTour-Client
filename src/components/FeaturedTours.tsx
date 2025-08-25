import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { fetchTours } from "../services/tour.service";
import { Link } from "react-router-dom";
import { SkeletonFeaturedTours } from "./Skeleton";
import "swiper/css";

export const FeaturedTours: React.FC = () => {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours({
      is_active: true,
      limit: 20,
      sortBy: "booked_count",
      sortOrder: "DESC"
    })
      .then((data) => {
        const highRatedTours = data.data
          .filter((tour: any) => {
            if (!tour.total_star || !tour.review_count || tour.review_count === 0) {
              return true;
            }
            const averageRating = tour.total_star / tour.review_count;
            return averageRating >= 4.0;
          })
          .slice(0, 6);
        
        setTours(highRatedTours);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu tour nổi bật.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <SkeletonFeaturedTours />;
  }

  if (error) {
    return (
      <div className="w-full py-16 text-center text-red-500 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div
      className="w-full py-16 flex flex-col justify-center"
      data-section="featured-tours"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[#015294] mb-8 text-center">
        TOUR NỔI BẬT TRONG THÁNG
      </h2>
      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={4}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          speed={500}
          breakpoints={{
            1536: { slidesPerView: 4 },
            1280: { slidesPerView: 3 },
            1024: { slidesPerView: 3 },
            768: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
          }}
        >
          {tours.map((tour, idx) => (
            <SwiperSlide key={idx} className="px-1">
              <Link
                to={`/tour/${tour.slug}`}
                className="relative rounded-xl overflow-hidden h-full flex flex-col group cursor-pointer"
              >
                <img
                  src={tour.poster_url}
                  alt={tour.title}
                  className="w-full h-[420px] md:h-[500px] lg:h-[540px] object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Rating Badge - Top Right */}
                {(!tour.total_star || !tour.review_count || tour.review_count === 0) ? (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Mới
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    ⭐ {(tour.total_star / tour.review_count).toFixed(1)}
                  </div>
                )}
                
                {/* Location Badge - Top Left */}
                {tour.location && (
                  <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    📍 {tour.location}
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-6 pt-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <h3 className="text-lg font-bold text-white mb-2 uppercase text-center drop-shadow line-clamp-2">
                    {tour.title}
                  </h3>
                  
                  {/* Tour Details Grid */}
                  <div className="flex items-center justify-center mb-3 text-white text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-300">📅</span>
                      <span>{tour.duration}</span>
                    </div>
                  </div>
                  
                  {/* Price Section */}
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-yellow-400 drop-shadow">
                      {tour.price ? `Từ ${tour.price.toLocaleString()}đ` : 'Liên hệ'}
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <span className="border border-white text-white bg-black/40 hover:bg-white hover:text-black px-4 py-2 rounded-full font-medium transition-all duration-300">
                    Xem chi tiết
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default FeaturedTours;
