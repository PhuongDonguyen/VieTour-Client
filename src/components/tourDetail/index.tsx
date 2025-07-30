import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TourNamePrice from "./TourNamePrice";
import TourImage from "./TourImage";
import TourDetailContent from "./TourDetailContent";
import TabPrice from "./TabPrice";
import TabInfo from "./TabInfo";
import TabOverview from "./TabOverview";
import TabCondition from "./TabCondition";
import TabGallery from "./TabGallery";
import { fetchTourBySlug } from "../../services/tour.service";
import { fetchTourDetail } from "../../services/tourDetail.service";
import { fetchTourImages } from "../../services/tourImage.service";
import { useTourViewTracking } from "../../hooks/useTourViewTracking";
import { TabReview } from "../tourDetail/TabReview";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommentSection } from "../question";

const TABS = [
  { key: "program", label: "Chương trình tour" },
  { key: "price", label: "Bảng giá" },
  { key: "info", label: "Thông tin tour" },
  { key: "overview", label: "Tổng quan tour" },
  { key: "condition", label: "Điều kiện tour" },
  { key: "gallery", label: "Hình ảnh tour" },
  { key: "review", label: "Đánh giá" },
];

const TourDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("program");
  const [showCommentSection, setShowCommentSection] = useState(false);

  // Track tour view count with session strategy
  useTourViewTracking(tour?.id, loading, !!error);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchTourBySlug(slug)
      .then((tourData) => {
        if (tourData) {
          setTour(tourData);
          return Promise.all([
            fetchTourDetail(tourData.id),
            fetchTourImages(tourData.id),
          ]);
        } else {
          throw new Error("Không tìm thấy tour.");
        }
      })
      .then(([detail, imgs]) => {
        setDays(detail);
        setImages(imgs);
        setLoading(false);

        // Delay hiển thị comment section để mượt mà hơn
        setTimeout(() => {
          setShowCommentSection(true);
        }, 500);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải dữ liệu tour.");
        setLoading(false);
      });
  }, [slug]);

  if (loading)
    return (
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto rounded-xl bg-transparent h-[750px] md:h-[80vh] flex flex-col md:flex-row overflow-hidden animate-pulse">
          <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4 pt-4 flex flex-col bg-white hide-scrollbar">
            <Skeleton height={400} className="mb-6" />
          </div>
          <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4 hide-scrollbar">
            <Skeleton
              height={40}
              width={300}
              style={{ marginBottom: 24, marginTop: 24 }}
            />
            <Skeleton count={10} height={20} style={{ marginBottom: 8 }} />
          </div>
        </div>
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!tour) return null;

  const displayPrice = tour.price || "1.750.000VND";

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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="pt-24 px-4">
        {/* Phần trên: tên + giá + nút đặt */}
        <TourNamePrice
          title={tour.title}
          price={displayPrice}
          tourSlug={tour.slug}
        />
        {/* Nav bar chuyển tab */}
        <div className="max-w-7xl mx-auto flex space-x-4 border-b border-gray-200 mt-10 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-200 ${
                activeTab === tab.key
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Nội dung tab */}
        <div>
          {activeTab === "program" && (
            <div className="w-full max-w-7xl mx-auto rounded-xl bg-transparent h-[750px] md:h-[80vh] flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4 pt-4 flex flex-col bg-white hide-scrollbar">
                <TourImage
                  images={
                    images.length > 0
                      ? images.filter((img) => img.is_featured)
                      : [
                          {
                            id: 0,
                            image_url: tour.poster_url,
                            alt_text: tour.title,
                          },
                        ]
                  }
                  altDefault={tour.title}
                />
              </div>
              <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4 hide-scrollbar">
                <TourDetailContent days={days} />
              </div>
            </div>
          )}
          {activeTab === "price" && <TabPrice tourId={tour.id} />}
          {activeTab === "info" && (
            <TabInfo
              id={tour.id}
              live_commentary={tour.live_commentary}
              duration={tour.duration}
              transportation={tour.transportation}
              accommodation={tour.accommodation}
            />
          )}
          {activeTab === "overview" && (
            <TabOverview destination_intro={tour.destination_intro} />
          )}
          {activeTab === "condition" && (
            <TabCondition tour_info={tour.tour_info} />
          )}
          {activeTab === "gallery" && <TabGallery images={images} />}
          {activeTab === "review" && (
            <TabReview
              tourId={tour.id}
              totalStar={tour.total_star}
              reviewCount={tour.review_count}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TourDetail;
