import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { getCarouselData } from "../../apis/carousel.api";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { ImageSize, ImageQuality, transformCloudinaryUrl } from "../../utils/imageUtils";

export const HeroSection = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isVisible, elementRef } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true
  });

  useEffect(() => {
    setIsLoading(true);
    getCarouselData()
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const apiSlides = res.data.data.map((item: any) => {
            const tour = item.tour;
            const priceObj = tour.tour_prices && tour.tour_prices[0];
            return {
              id: tour.id,
              image: transformCloudinaryUrl(tour.poster_url, ImageSize.HERO, ImageQuality.HIGH, 'f_auto'),
              title: tour.title,
              price: priceObj
                ? `${priceObj.adult_price.toLocaleString()} VND`
                : "",
              duration: tour.duration || "",
              slug: tour.slug,
            };
          });
          setSlides(apiSlides);
        } else {
          setSlides([]);
        }
      })
      .catch(() => {
        setSlides([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div
      ref={elementRef}
      className={`relative h-screen overflow-hidden transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
    >
      {isLoading ? (
        // Loading placeholder
        <div className="w-full h-full bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 animate-pulse relative">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="text-left max-w-5xl px-40 ml-8">
              {/* Title skeleton */}
              <div className="bg-white/20 rounded-lg h-16 w-3/4 mb-6 animate-pulse"></div>

              {/* Info section skeleton */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-white/20 rounded h-6 w-32 animate-pulse"></div>
              </div>

              {/* Price skeleton */}
              <div className="bg-white/20 rounded-lg h-10 w-64 mb-8 animate-pulse"></div>

              {/* Button skeleton */}
              <div className="bg-white/20 rounded-lg h-12 w-40 animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="h-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              {slide.slug ? (
                <Link
                  to={`/tour/${slide.slug}`}
                  className="w-full h-full block bg-cover bg-center bg-no-repeat relative cursor-pointer group"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex items-center">
                    <div className={`text-left text-white max-w-5xl px-40 ml-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}>
                      <h1 className="text-2xl md:text-4xl font-semibold mb-6 leading-tight">
                        {slide.title}
                      </h1>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-orange-500" />
                          <span>{slide.duration}</span>
                        </div>
                      </div>
                      <div className="text-2xl md:text-2xl font-bold text-orange-400 mb-8">
                        {slide.price}
                      </div>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Đặt Tour Ngay
                      </button>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat relative"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex items-center">
                    <div className={`text-left text-white max-w-4xl px-40 ml-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}>
                      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl mb-8 text-white/90">
                        {slide.subtitle}
                      </p>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <span>Miền Tây Nam Bộ</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-orange-500" />
                          <span>{slide.duration || "3 ngày 2 đêm"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-orange-500" />
                          <span>Theo đoàn</span>
                        </div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-8">
                        {slide.price}
                      </div>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Đặt Tour Ngay
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};
