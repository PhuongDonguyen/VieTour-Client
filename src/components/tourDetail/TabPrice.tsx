import React, { useEffect, useState } from "react";
import { fetchTourPricesByTourId } from "../../services/tourPrice.service";

interface TabPriceProps {
  tourId: number;
}

const TabPrice: React.FC<TabPriceProps> = ({ tourId }) => {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tourId) return;
    setLoading(true);
    setError(null);

    fetchTourPricesByTourId(tourId)
      .then((res) => {
        setPrices(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tour prices:", err);
        setError("Không thể tải bảng giá.");
        setLoading(false);
      });
  }, [tourId]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải bảng giá...</div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!prices.length)
    return (
      <div className="p-8 text-center text-gray-500">
        Chưa có bảng giá cho tour này.
      </div>
    );

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
                  <th className="py-3 px-4 font-semibold text-center">
                    Giá người lớn
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Giá trẻ em
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Ghi chú
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b border-blue-800 last:border-b-0"
                  >
                    <td className="py-3 px-4 text-center">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-lg text-gray-800 text-center">
                      {row.adult_price.toLocaleString()} VND
                    </td>
                    <td className="py-3 px-4 font-bold text-lg text-gray-800 text-center">
                      {row.kid_price.toLocaleString()} VND
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-center">
                      {row.note}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-full transition-all">
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
