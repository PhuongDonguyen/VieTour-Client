import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/autoplay";
import { fetchActiveTourCategories } from '../service/tourCategory.service';

export const TourListCarousel: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveTourCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh mục tour');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="w-full py-8 text-center text-lg text-gray-500">Đang tải danh mục tour...</div>;
  }
  if (error) {
    return <div className="w-full py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full py-8 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8 text-center">DANH SÁCH TOUR</h2>
      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={5}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          speed={500}
          breakpoints={{
            1536: { slidesPerView: 5 },
            1280: { slidesPerView: 4 },
            1024: { slidesPerView: 3 },
            768: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
          }}
          threshold={20}
        >
          {categories.map((cat, idx) => (
            <SwiperSlide key={cat.id} className="px-1">
              <div className="relative rounded-2xl overflow-hidden h-[270px] md:h-[300px] lg:h-[320px] flex flex-col cursor-pointer group bg-blue-100">
                {/* Nếu có image_url thì hiển thị, không thì dùng màu nền */}
                {cat.image_url ? (
                <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 scale-105 group-hover:translate-x-2"
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-blue-700 font-bold">
                    {cat.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none" style={{background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)'}} />
                <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col items-start">
                  <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg truncate uppercase">
                    {cat.name}
                  </h3>
                  <div className="text-xs text-orange-400 font-semibold drop-shadow-lg bg-black/30 px-2 py-1 rounded-full">
                    {cat.tour_count} Tour
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TourListCarousel; 