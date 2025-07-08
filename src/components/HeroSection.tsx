import { MapPin, Calendar, Users } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export const HeroSection = () => {
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
      title: "TOUR CÀ MAU 3 NGÀY 2 ĐÊM",
      subtitle: "Tiền Giang - Cần Thơ - Cà Mau - Bạc Liêu - Sóc Trăng",
      price: "2.890.000VND",
      description: "Khám phá vẻ đẹp hoang sơ của mũi Cà Mau cùng với những trải nghiệm độc đáo"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop",
      title: "TOUR ĐỒNG BẰNG SÔNG CỬU LONG",
      subtitle: "Cần Thơ - An Giang - Kiên Giang - Cà Mau",
      price: "3.500.000VND",
      description: "Trải nghiệm cuộc sống sông nước miền Tây Nam Bộ đầy thú vị"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1920&h=1080&fit=crop",
      title: "TOUR KHÁM PHÁ RỪNG TẮM",
      subtitle: "U Minh Hạ - Cà Mau - Bạc Liêu",
      price: "2.200.000VND",
      description: "Khám phá hệ sinh thái rừng tràm độc đáo của miền Tây Nam Bộ"
    }
  ];

  return (
    <div className="relative h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat relative"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="text-left text-white max-w-4xl px-40 ml-8">
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
                      <span>3 ngày 2 đêm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <span>Theo đoàn</span>
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-8">
                    Giá: {slide.price}
                  </div>
                  <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  <div className="flex space-x-4">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105">
                      ĐẶT NGAY
                    </button>
                    <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
