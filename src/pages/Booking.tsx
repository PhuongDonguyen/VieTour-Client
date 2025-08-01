import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TabBooking } from '../components/tourDetail/TabBooking';
import { fetchTourBySlug } from '../services/tour.service';

export default function Booking() {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadTourData = async () => {
      try {
        setLoading(true);
        const tourData = await fetchTourBySlug(slug);
        if (tourData) {
          console.log(tourData);
          setTour(tourData);
        } else {
          setError('Không tìm thấy thông tin tour');
        }
      } catch (err) {
        setError('Không thể tải thông tin tour');
        console.error('Error loading tour:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTourData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-24">
        {/* Tour Booking Form wrapper - giảm độ rộng bằng form điền thông tin */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Tiêu đề khớp với độ rộng form */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Đặt Tour</h1>
            <p className="text-gray-600 text-sm">Điền thông tin để hoàn tất đặt tour của bạn</p>
          </div>

          {/* Thông tin tour khớp với độ rộng form */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-600">Tour ID: {tour.id}</div>
              <div className="text-lg font-semibold text-blue-800">{tour.title}</div>
              <div className="text-sm text-gray-600">Thời gian: {tour.duration}</div>
            </div>
          </div>

          {/* Form content */}
          <div className="-mx-6 -mb-6">
            <TabBooking
              tourId={tour.id}
              tourTitle={tour.title}
              tourPrice={tour.price}
              tourCapacity={tour.capacity}
              duration={tour.duration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
