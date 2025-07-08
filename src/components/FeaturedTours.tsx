import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/autoplay";
// @ts-ignore
import "swiper/css/navigation";
import { fetchTopBookedTours } from '../service/tour.service';

export const FeaturedTours: React.FC = () => {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopBookedTours(10)
      .then((data) => {
        setTours(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Không thể tải dữ liệu tour nổi bật.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 text-center text-lg text-gray-500">Đang tải tour nổi bật...</div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8 text-center text-red-500">{error}</div>
    );
  }

  return (
    <div className="w-full py-8">
      <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8 text-center">
        TOUR NỔI BẬT TRONG THÁNG
      </h2>
      <div className="relative">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={16}
          slidesPerView={4}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          speed={500}
          navigation={{
            nextEl: ".featured-next",
            prevEl: ".featured-prev",
          }}
          breakpoints={{
            1536: { slidesPerView: 4 },
            1280: { slidesPerView: 3 },
            1024: { slidesPerView: 3 },
            768: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
          }}
          threshold={20}
        >
          {tours.map((tour, idx) => (
            <SwiperSlide key={idx} className="px-1">
              <div className="relative rounded-2xl shadow-lg overflow-hidden h-full flex flex-col group">
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className="w-full h-[420px] md:h-[500px] lg:h-[540px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-6 pt-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <h3 className="text-lg font-bold text-orange-400 mb-1 uppercase text-center drop-shadow">
                    {tour.title}
                  </h3>
                  <div className="text-sm text-white mb-1 text-center drop-shadow">{tour.duration}</div>
                  <div className="text-base font-semibold text-white mb-2 text-center drop-shadow">
                    Giá: {tour.price}
                  </div>
                  <button className="border-2 border-white text-white bg-black/60 hover:bg-orange-500 px-4 py-1 rounded-full font-semibold transition-all w-fit self-center">
                    ĐẶT NGAY
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <button className="featured-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/95 shadow-lg rounded-full w-9 h-9 flex items-center justify-center border border-gray-200 transition-all" aria-label="Previous">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="featured-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/95 shadow-lg rounded-full w-9 h-9 flex items-center justify-center border border-gray-200 transition-all" aria-label="Next">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </Swiper>
      </div>
    </div>
  );
};

export default FeaturedTours;
