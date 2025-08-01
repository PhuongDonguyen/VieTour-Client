import React, { useEffect, useState } from "react";
import { tourPriceService } from "../../services/tourPrice.service";

interface TabPriceProps {
  tourId: number;
}

interface PriceData {
  id: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

const TabPrice: React.FC<TabPriceProps> = ({ tourId }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!tourId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await tourPriceService.getTourPricesByTourId(tourId);
        setPrices(res?.data?.data || []);
      } catch (err) {
        console.error('Error fetching tour prices:', err);
        setError("Không thể tải bảng giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [tourId]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Bảng giá</h2>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 font-semibold text-center">STT</th>
                    <th className="py-3 px-4 font-semibold text-center">Giá người lớn</th>
                    <th className="py-3 px-4 font-semibold text-center">Giá trẻ em</th>
                    <th className="py-3 px-4 font-semibold text-center">Ghi chú</th>
                    <th className="py-3 px-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(2)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-3 px-4 text-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-6 mx-auto"></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="h-8 bg-gray-200 rounded-full animate-pulse w-20 mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="p-8 text-center">
          <div className="text-red-500 text-lg font-medium mb-2">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!prices.length) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="p-8 text-center">
          <div className="text-gray-500 text-lg">Chưa có bảng giá cho tour này.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Bảng giá</h2>
        <div className="border-2 border-blue-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="py-3 px-4 font-semibold text-center">STT</th>
                  <th className="py-3 px-4 font-semibold text-center">Giá người lớn</th>
                  <th className="py-3 px-4 font-semibold text-center">Giá trẻ em</th>
                  <th className="py-3 px-4 font-semibold text-center">Ghi chú</th>
                  <th className="py-3 px-4 font-semibold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b border-blue-800 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-lg text-gray-800 text-center">
                      {row.adult_price.toLocaleString()} VND
                    </td>
                    <td className="py-3 px-4 font-bold text-lg text-gray-800 text-center">
                      {row.kid_price.toLocaleString()} VND
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-center">
                      {row.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95">
                        ĐẶT NGAY
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabPrice;
