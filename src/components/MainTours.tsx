import React from "react";
import { RatingStars } from "./RatingStarsProps";

type TourCardProps = {
  title: string;
  price: string;
  imageUrl: string;
  totalStar: number;
  reviewCount: number;
};

const TourCard: React.FC<TourCardProps> = ({
  title,
  price,
  imageUrl,
  totalStar,
  reviewCount,
}) => (
  <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
    {/* ✅ Hình ảnh với hiệu ứng zoom khi hover */}
    <div className="relative h-56 overflow-hidden group rounded-t-xl">
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
        Giá gốc:{" "}
        <span className="text-lg text-red-600 font-bold">{price}VND</span>
      </p>
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer">
        ĐẶT TOUR
      </button>
    </div>
    {/* Footer */}
    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
      <RatingStars totalStar={totalStar} reviewCount={reviewCount} />
    </div>
  </div>
);

const MainTours: React.FC = () => {
  const tours = [
    {
      title: "TOUR ĐỊA ĐẠO CỦ CHI",
      price: "350.000",
      imageUrl:
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
      totalStar: 15,
      reviewCount: 3,
    },
    {
      title: "TOUR 1 NGÀY MỸ THO - BẾN TRE",
      price: "480.000",
      imageUrl:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?w=400&h=300&fit=crop",
      totalStar: 10,
      reviewCount: 2,
    },
    {
      title: "TOUR 2 NGÀY 1 ĐÊM MỸ THO - BẾN TRE - CẦN THƠ",
      price: "1.550.000",
      imageUrl:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      totalStar: 14,
      reviewCount: 3,
    },
    {
      title: "TOUR CÔN ĐẢO - NGHĨA TRANG HÀNG DƯƠNG",
      price: "2.300.000",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      totalStar: 20,
      reviewCount: 4,
    },
    {
      title: "TOUR TÂY NINH - NÚI BÀ ĐEN",
      price: "750.000",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      totalStar: 18,
      reviewCount: 4,
    },
    {
      title: "KHÁM PHÁ ĐỊA ĐẠO CỦ CHI (BẢN QUỐC TẾ)",
      price: "390.000",
      imageUrl:
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop",
      totalStar: 15,
      reviewCount: 3,
    },
  ];

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

        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl">
            Xem thêm tour khác
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainTours;
