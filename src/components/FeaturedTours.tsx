import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const tours = [
  {
    title: "MỸ THO - BẾN TRE",
    duration: "1 NGÀY",
    price: "480.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
  {
    title: "TOUR TÂY NINH",
    duration: "1 NGÀY",
    price: "1.150.000VND",
    imageUrl:
      "https://tourbonphuong.com/thumbs/700x800x1/upload/hinhanh/tour-tay-ninh-nui-ba-den-1-ngay-3024.webp",
  },
  {
    title: "TOUR ĐỊA ĐẠO CỦ CHI",
    duration: "NỬA NGÀY",
    price: "350.000VND",
    imageUrl:
      "https://tourbonphuong.com/thumbs/700x800x1/upload/hinhanh/tour-tay-ninh-nui-ba-den-1-ngay-3024.webp",
  },
  {
    title: "TOUR CẦN GIỜ",
    duration: "1 NGÀY",
    price: "750.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
  {
    title: "MỸ THO - BẾN TRE - CẦN THƠ",
    duration: "2 NGÀY 1 ĐÊM",
    price: "1.550.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop",
  },
  {
    title: "TOUR CÔN ĐẢO",
    duration: "3 NGÀY 2 ĐÊM",
    price: "3.200.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop",
  },
  {
    title: "TOUR PHÚ QUỐC",
    duration: "3 NGÀY 2 ĐÊM",
    price: "2.900.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop",
  },
  {
    title: "TOUR ĐÀ LẠT",
    duration: "2 NGÀY 1 ĐÊM",
    price: "1.800.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
  {
    title: "TOUR NHA TRANG",
    duration: "3 NGÀY 2 ĐÊM",
    price: "2.500.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop",
  },
  {
    title: "TOUR SAPA",
    duration: "3 NGÀY 2 ĐÊM",
    price: "3.400.000VND",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
];

// Custom arrow components nhỏ gọn, overlay trong card
const ArrowLeft = (props: any) => (
  <button
    {...props}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/95 shadow-lg rounded-full w-9 h-9 flex items-center justify-center border border-gray-200 transition-all"
    style={{ ...props.style, display: "flex", padding: 0 }}
    aria-label="Previous"
  >
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
);
const ArrowRight = (props: any) => (
  <button
    {...props}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/95 shadow-lg rounded-full w-9 h-9 flex items-center justify-center border border-gray-200 transition-all"
    style={{ ...props.style, display: "flex", padding: 0 }}
    aria-label="Next"
  >
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
);

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  arrows: true,
  nextArrow: <ArrowRight />,
  prevArrow: <ArrowLeft />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export const FeaturedTours: React.FC = () => {
  return (
    <div className="w-full py-8">
      <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8 text-center">
        TOUR NỔI BẬT TRONG THÁNG
      </h2>
      <div className="relative">
        <Slider {...settings} className="px-1">
          {tours.map((tour, idx) => (
            <div key={idx} className="px-1 group">
              <div className="relative rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
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
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default FeaturedTours;
