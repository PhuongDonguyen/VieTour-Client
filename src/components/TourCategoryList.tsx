import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const tours = [
  {
    title: "MIỀN TÂY TRONG NGÀY",
    count: 6,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
  {
    title: "SÀI GÒN",
    count: 5,
    imageUrl: "https://tourbonphuong.com/thumbs/700x800x1/upload/hinhanh/tour-tay-ninh-nui-ba-den-1-ngay-3024.webp",
  },
  {
    title: "TOUR DỊCH VỤ",
    count: 3,
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop",
  },
  {
    title: "PHAN THIẾT",
    count: 5,
    imageUrl: "https://tourbonphuong.com/thumbs/700x800x1/upload/hinhanh/tour-tay-ninh-nui-ba-den-1-ngay-3024.webp",
  },
  {
    title: "ĐÀ LẠT",
    count: 5,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
];

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 1,
  arrows: false,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export const TourListCarousel: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full py-8 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8 text-center">DANH SÁCH TOUR</h2>
      <div className="relative">
        <Slider {...settings} className="px-1">
          {tours.map((tour, idx) => (
            <div key={idx} className="px-1 group">
              <div className="relative rounded-2xl overflow-hidden h-[270px] md:h-[300px] lg:h-[320px] flex flex-col cursor-pointer">
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className="w-full h-full object-cover transition-transform duration-300 scale-105 group-hover:translate-x-2"
                />
                {/* Overlay hover: gradient từ hồng dưới trái sang xanh dương trên phải, opacity nhẹ */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none" style={{background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)'}} />
                <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col items-start">
                  <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg truncate uppercase">
                    {tour.title}
                  </h3>
                  <div className="text-base text-white font-semibold drop-shadow-lg">{tour.count} Tour</div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default TourListCarousel; 