import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TourNamePrice from "./TourNamePrice";
import TourImage from "./TourImage";
import TourDetailContent from "./TourDetailContent";
import CommentForm from "./CommentForm";
import TabPrice from "./TabPrice";
import TabInfo from "./TabInfo";
import TabOverview from "./TabOverview";
import TabCondition from "./TabCondition";
import TabGallery from "./TabGallery";
import { fetchTourBySlug } from '../../service/tour.service';
import { fetchTourDetail } from '../../service/tourDetail.service';
import { fetchTourImages } from '../../service/tourImage.service';

const TABS = [
  { key: 'program', label: 'Chương trình tour' },
  { key: 'price', label: 'Bảng giá' },
  { key: 'info', label: 'Thông tin tour' },
  { key: 'overview', label: 'Tổng quan tour' },
  { key: 'condition', label: 'Điều kiện tour' },
  { key: 'gallery', label: 'Hình ảnh tour' },
];

const TourDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('program');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchTourBySlug(slug)
      .then(data => {
        if (data && data.length > 0) {
          const tourData = data[0];
          setTour(tourData);
          return Promise.all([
            fetchTourDetail(tourData.id),
            fetchTourImages(tourData.id)
          ]);
        } else {
          throw new Error('Không tìm thấy tour.');
        }
      })
      .then(([detail, imgs]) => {
        setDays(detail);
        setImages(imgs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Lỗi khi tải dữ liệu tour.');
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải chi tiết tour...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!tour) return null;

  const displayPrice = tour.price || '1.750.000VND';

  return (
    <>
      <style>{`
        .navbar-custom-black * {
          color: #111 !important;
        }
        .navbar-custom-black a, .navbar-custom-black button, .navbar-custom-black span, .navbar-custom-black li, .navbar-custom-black div {
          color: #111 !important;
        }
        .navbar-custom-black a:hover, .navbar-custom-black button:hover, .navbar-custom-black li:hover, .navbar-custom-black .nav-link:hover {
          color: #f97316 !important;
          background: #f3f4f6 !important;
        }
        .navbar-custom-black input, .navbar-custom-black input::placeholder {
          color: #111 !important;
          opacity: 1 !important;
        }
        .topbar-detail {
          background: #fff !important;
          color: #222 !important;
        }
        .topbar-detail * {
          color: #222 !important;
        }
        .topbar-detail button {
          background: #f97316 !important;
          color: #fff !important;
        }
        .topbar-detail button:hover {
          background: #ea580c !important;
        }
      `}</style>
      <div className="pt-24 px-4">
        {/* Phần trên: tên + giá + nút đặt */}
        <TourNamePrice title={tour.title} price={displayPrice} />
        {/* Nav bar chuyển tab */}
        <div className="max-w-7xl mx-auto flex space-x-4 border-b border-gray-200 mt-10 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-200 ${activeTab === tab.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-600 hover:text-orange-500'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Nội dung tab */}
        <div>
          {activeTab === 'program' && (
            <div className="w-full max-w-7xl mx-auto rounded-xl shadow-lg bg-white h-[750px] md:h-[80vh] flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4 flex flex-col bg-gray-50 items-center justify-center">
                <TourImage images={images.length > 0 ? images : [{ id: 0, image_url: tour.poster_url, alt_text: tour.title }]} altDefault={tour.title} />
              </div>
              <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4">
                <TourDetailContent days={days} />
              </div>
            </div>
          )}
          {activeTab === 'price' && <TabPrice />}
          {activeTab === 'info' && <TabInfo />}
          {activeTab === 'overview' && <TabOverview />}
          {activeTab === 'condition' && <TabCondition />}
          {activeTab === 'gallery' && <TabGallery />}
        </div>
        {/* Form nhận xét luôn hiển thị dưới tab, ngoài box nội dung */}
        <CommentForm />
      </div>
    </>
  );
};

export default TourDetail; 