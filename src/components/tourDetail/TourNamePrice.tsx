import React from 'react';

type TourNamePriceProps = {
  title: string;
  price: string;
};

const TourNamePrice: React.FC<TourNamePriceProps> = ({ title, price }) => (
  <div className="max-w-7xl mx-auto mb-8 text-left">
    <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">{title}</h1>
    <div className="text-2xl font-bold text-orange-600 mb-4">Giá: {price}</div>
    <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl">
      ĐẶT NGAY
    </button>
  </div>
);

export default TourNamePrice; 