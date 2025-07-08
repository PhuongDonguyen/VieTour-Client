import React, { useEffect, useState } from 'react';
import TourDetailContent from '../components/TourDetailContent';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/tour_details?tour_id=1';

const TourDetail: React.FC = () => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        if (res.data && res.data.success) {
          setDays(res.data.data);
        } else {
          setError('Không tìm thấy dữ liệu tour.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Lỗi khi tải dữ liệu tour.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải chi tiết tour...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Chi tiết lịch trình tour</h1>
      <TourDetailContent days={days} />
    </div>
  );
};

export default TourDetail; 