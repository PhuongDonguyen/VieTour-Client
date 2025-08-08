import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TourNamePrice from "./TourNamePrice";
import TourImage from "./TourImage";
import TourDetailContent from "./TourDetailContent";
import TabPrice from "./TabPrice";
import TabInfo from "./TabInfo";
import TabOverview from "./TabOverview";
import TabCondition from "./TabCondition";
import TabGallery from "./TabGallery";
import { fetchTourBySlug } from "../../services/tour.service";
import { fetchTourDetailsByTourId } from "../../services/tourDetail.service";
import { fetchTourImagesByTourId } from "../../services/tourImage.service";
import { useTourViewTracking } from "../../hooks/useTourViewTracking";
import { TabReview } from "../tourDetail/TabReview";
import { TabFAQ } from "../tourDetail/TabFAQ";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommentSection } from "../question";

const TABS = [
  { key: "program", label: "Chương trình tour", icon: "🗺️" },
  { key: "price", label: "Bảng giá", icon: "💰" },
  { key: "info", label: "Thông tin tour", icon: "ℹ️" },
  { key: "overview", label: "Tổng quan tour", icon: "📋" },
  { key: "condition", label: "Điều kiện tour", icon: "📝" },
  { key: "gallery", label: "Hình ảnh tour", icon: "📸" },
  { key: "review", label: "Đánh giá", icon: "⭐" },
  { key: "faq", label: "Câu hỏi thường gặp", icon: "❓" },
];

const TourDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("program");
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // Track tour view count with session strategy
  useTourViewTracking(tour?.id, loading, !!error);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fade in animation
  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // Show floating button on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingButton(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadTourData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      setIsVisible(false);

      try {
        const tourData = await fetchTourBySlug(slug);
        if (tourData) {
          setTour(tourData);
          const [detail, imgs] = await Promise.all([
            fetchTourDetailsByTourId(tourData.id),
            fetchTourImagesByTourId(tourData.id),
          ]);
          setDays(detail.data || []);
          setImages(imgs.data || []);
          setLoading(false);

          // Delay hiển thị comment section để mượt mà hơn
          setTimeout(() => {
            setShowCommentSection(true);
          }, 500);
        } else {
          throw new Error("Không tìm thấy tour.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu tour.");
        setLoading(false);
      }
    };

    loadTourData();
  }, [slug]);

  const handleBookNow = () => {
    navigate(`/booking/${tour.slug}`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="pt-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse mb-8"></div>
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-6 w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded-xl animate-pulse mb-8 w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

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
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .fade-in-up-delay-1 {
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }
        
        .fade-in-up-delay-2 {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        
        .fade-in-up-delay-3 {
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .slide-in-up {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="pt-24 px-4">
          {/* Hero Section */}
          <div
            className={`transition-opacity duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <TourNamePrice
              title={tour.title}
              price={displayPrice}
              tourSlug={tour.slug}
              loading={loading}
            />
          </div>

          {/* Navigation Tabs */}
          <div
            className={`max-w-7xl mx-auto mb-8 fade-in-up-delay-1 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div
            className={`max-w-7xl mx-auto fade-in-up-delay-2 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {activeTab === "program" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                  <div className="p-6 lg:p-8 bg-gray-50">
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
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-orange-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Lịch trình tour
                      </h2>
                    </div>
                    <div className="hide-scrollbar overflow-y-auto max-h-[500px]">
                      <TourDetailContent days={days} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "price" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabPrice tourId={tour.id} />
              </div>
            )}

            {activeTab === "info" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabInfo
                  id={tour.id}
                  live_commentary={tour.live_commentary}
                  duration={tour.duration}
                  transportation={tour.transportation}
                  accommodation={tour.accommodation}
                />
              </div>
            )}

            {activeTab === "overview" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabOverview destination_intro={tour.destination_intro} />
              </div>
            )}

            {activeTab === "condition" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabCondition tour_info={tour.tour_info} />
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabGallery images={images} />
              </div>
            )}

            {activeTab === "review" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabReview
                  tourId={tour.id}
                  totalStar={tour.total_star}
                  reviewCount={tour.review_count}
                />
              </div>
            )}

            {activeTab === "faq" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <TabFAQ tourId={tour.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {showFloatingButton && (
        <div className="fixed bottom-6 right-6 z-50 slide-in-up">
          <button
            onClick={handleBookNow}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="hidden sm:inline">Đặt ngay</span>
          </button>
        </div>
      )}

      {showCommentSection && (
        <div className="fade-in-up-delay-3">
          <CommentSection />
        </div>
      )}
    </>
  );
};

export default TourDetail;
