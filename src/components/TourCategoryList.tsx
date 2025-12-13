import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Link } from 'react-router-dom';
import { fetchActiveTourCategories } from '../services/tourCategory.service';
import { SkeletonTourCategories } from './Skeleton';
import "swiper/css";
import { ImageSize, ImageQuality, transformCloudinaryUrl } from "../utils/imageUtils";

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
    return <SkeletonTourCategories />;
  }

  if (error) {
    return <div className="w-full py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#015294] mb-4">DANH MỤC TOUR</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            speed={600}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {categories.map((cat, idx) => (
              <SwiperSlide key={idx}>
                <Link
                  to={`/tour-category/${cat.slug}`}
                  className="block group"
                >
                  <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100">
                    {cat.image_url ? (
                      <img
                        src={transformCloudinaryUrl(cat.image_url, ImageSize.THUMBNAIL, ImageQuality.HIGH, 'f_auto')}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-center text-lg mb-1 line-clamp-2">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default TourListCarousel; 