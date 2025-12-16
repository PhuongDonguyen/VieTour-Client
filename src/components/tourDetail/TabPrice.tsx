import React, { useEffect, useState } from "react";
import { fetchTourPricesByTourId } from "../../services/tourPrice.service";

interface TabPriceProps {
  tourId: number;
}

interface PriceData {
  id: number;
  adult_price: number;
  kid_price: number;
  note?: string;
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
        const res = await fetchTourPricesByTourId(tourId);
        setPrices(res?.data || []);
      } catch (err) {
        console.error("Error fetching tour prices:", err);
        setError("Không thể tải bảng giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [tourId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bảng giá
        </h2>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="h-6 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bảng giá
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!prices.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bảng giá
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có bảng giá
          </h3>
          <p className="text-gray-600">
            Chưa có bảng giá cho tour này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Bảng giá ({prices.length} gói)
      </h2>

      <div className="space-y-4">
        {prices.map((price, index) => (
          <div
            key={price.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-600">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {price.note || `Gói ${index + 1}`}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Giá người lớn</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {price.adult_price.toLocaleString()} VND
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Giá trẻ em</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {price.kid_price.toLocaleString()} VND
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabPrice;
