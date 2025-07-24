import React from 'react';
import { useNavigate } from 'react-router-dom';

type TourNamePriceProps = {
  title: string;
  price: string;
  tourSlug: string;
};

const TourNamePrice: React.FC<TourNamePriceProps> = ({ title, price, tourSlug }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/booking/${tourSlug}`);
  };

  return (
    <div className="max-w-7xl mx-auto mb-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-[#2195c4] mb-4 leading-tight">
        {title}
      </h1>
      <div className="text-2xl md:text-3xl font-semibold text-[#FF6B35] mb-6">
        Giá: {price}
      </div>
      <button 
        onClick={handleBookNow}
        className="bg-[#FF6B35] hover:bg-[#e65a28] text-white font-semibold px-6 py-3 rounded-xl transition duration-300 hover:shadow-lg"
      >
        ĐẶT NGAY
      </button>
    </div>
  );
};

export default TourNamePrice;
