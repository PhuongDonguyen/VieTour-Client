import React, { Suspense, lazy, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, Home, MessageCircle } from "lucide-react";
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
import { getProviderProfileById } from "../../apis/providerProfile.api";
import { getTourCategoryById } from "../../apis/tourCategory.api";
import { useTourViewTracking } from "../../hooks/useTourViewTracking";
import { useAutoTrackTourView } from "../../hooks/useRecentlyViewedTours";
import { TabReview } from "../tourDetail/TabReview";
import { TabFAQ } from "../tourDetail/TabFAQ";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommentSection } from "../question";
import RecentlyViewedTours from "../RecentlyViewedTours";
import { searchSimilarTours, SimilarTour } from "../../apis/tour.api"; // <-- add this import

const SimilarToursSection = lazy(() => import("./SimilarToursSection"));

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
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [tourCategory, setTourCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("program");
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [stickyNav, setStickyNav] = useState(false);
  const [similarTours, setSimilarTours] = useState<SimilarTour[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Track tour view count with session strategy
  useTourViewTracking(tour?.id, loading, !!error);

  // Track recently viewed tours
  useAutoTrackTourView(tour, loading, !!error);

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

  // Show floating button on scroll & sticky nav
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingButton(scrollY > 300);
      setStickyNav(scrollY > 400);

      // Update active tab based on scroll position
      const sections = TABS.map(tab => document.getElementById(tab.key));
      const scrollPosition = scrollY + 250; // Offset for sticky nav

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const rect = section.getBoundingClientRect();
          const absoluteTop = rect.top + window.pageYOffset;
          if (absoluteTop <= scrollPosition) {
            setActiveTab(TABS[i].key);
            break;
          }
        }
      }
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
      setTourCategory(null);

      try {
        const tourData = await fetchTourBySlug(slug);
        if (tourData) {
          console.log("Tour data:", tourData);
          setTour(tourData);

          const [detail, imgs, provider] = await Promise.all([
            fetchTourDetailsByTourId(tourData.id),
            fetchTourImagesByTourId(tourData.id),
            getProviderProfileById(tourData.provider_id),
          ]);

          setDays(detail.data || []);
          setImages(imgs.data || []);

          // Handle provider profile response - check if it's wrapped or direct
          console.log("Provider API response:", provider);
          const providerData = provider.data || provider;
          console.log("Provider data:", providerData);
          setProviderProfile(providerData);

          // Fetch category separately if tour has category_id
          if (tourData.tour_category_id) {
            try {
              const categoryResponse = await getTourCategoryById(
                tourData.tour_category_id
              );
              console.log("Category API response:", categoryResponse);
              const categoryData = categoryResponse.data;
              console.log("Category data:", categoryData);
              setTourCategory(categoryData.data);
            } catch (categoryError) {
              console.error("Error fetching tour category:", categoryError);
              setTourCategory(null);
            }
          }
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

  // Fetch similar tours when tour is loaded
  useEffect(() => {
    if (!tour?.title) return;
    setLoadingSimilar(true);
    searchSimilarTours({ tourInfo: tour.title })
      .then((res) => {
        if (res.success && Array.isArray(res.tours)) {
          setSimilarTours(res.tours);
        } else {
          setSimilarTours([]);
        }
      })
      .catch(() => setSimilarTours([]))
      .finally(() => setLoadingSimilar(false));
  }, [tour?.title]);

  const handleChatWithProvider = () => {
    if (tour?.provider_id) {
      navigate(`/chat?provider=${tour.provider_id}`);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 180; // Account for sticky nav (16px top + nav height + padding)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

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
          {/* Breadcrumb */}
          {tour ? (
            <div
              className={`max-w-7xl mx-auto mb-6 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            >
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link
                  to="/"
                  className="flex items-center hover:text-orange-600 transition-colors duration-200"
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span>Trang chủ</span>
                </Link>
                {tourCategory && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      to={`/tour-category/${tourCategory.slug}`}
                      className="hover:text-orange-600 transition-colors duration-200"
                    >
                      {tourCategory.name}
                    </Link>
                  </>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  {tour.title}
                </span>
              </nav>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto mb-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </div>
          )}

          {/* Hero Section */}
          {tour && !loading ? (
            <div
              className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            >
              <TourNamePrice
                title={tour.title}
                price={displayPrice}
                tourSlug={tour.slug}
                loading={false}
                location={tour.starting_point}
                duration={tour.duration}
                companyName={providerProfile?.company_name}
                totalStar={tour.total_star}
                reviewCount={tour.review_count}
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Title skeleton */}
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-2/3"></div>
                  </div>

                  {/* Rating and info skeleton */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Price and company skeleton */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-12 w-32 bg-orange-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs - Sticky on scroll */}
          {tour ? (
            <div
              className={`${stickyNav ? 'fixed top-16 left-0 right-0 z-40 shadow-xl' : 'relative'} transition-all duration-300 bg-white ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
                  <div className="flex gap-2 justify-between">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap flex-1 text-sm sm:text-base ${activeTab === tab.key
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                          }`}
                        onClick={() => scrollToSection(tab.key)}
                      >
                        <span className="text-base sm:text-lg">{tab.icon}</span>
                        <span className="hidden lg:inline text-xs xl:text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto mb-8">
              <div className="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          )}

          {/* Spacer when nav becomes sticky */}
          {stickyNav && <div className="h-24"></div>}

          {/* All Content Sections - Displayed together */}
          {tour && !loading ? (
            <div
              className={`max-w-7xl mx-auto fade-in-up-delay-2 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            >
              {/* Main Content Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Program Section */}
                <section id="program" className="scroll-mt-32">
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Lịch trình tour
                      </h2>
                      <div className="hide-scrollbar overflow-y-auto max-h-[500px]">
                        <TourDetailContent days={days} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Price Section */}
                <section id="price" className="scroll-mt-32 p-6 lg:p-8">
                  <TabPrice tourId={tour.id} />
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Info Section */}
                <section id="info" className="scroll-mt-32 p-6 lg:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin tour</h2>
                  <TabInfo
                    id={tour.id}
                    live_commentary={tour.live_commentary}
                    duration={tour.duration}
                    transportation={tour.transportation}
                    accommodation={tour.accommodation}
                  />
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Overview Section */}
                <section id="overview" className="scroll-mt-32">
                  <TabOverview destination_intro={tour.destination_intro} />
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Condition Section */}
                <section id="condition" className="scroll-mt-32">
                  <TabCondition tour_info={tour.tour_info} />
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Gallery Section */}
                <section id="gallery" className="scroll-mt-32">
                  <TabGallery images={images} />
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Review Section */}
                <section id="review" className="scroll-mt-32 p-6 lg:p-8">
                  <TabReview
                    tourId={tour.id}
                    totalStar={tour.total_star}
                    reviewCount={tour.review_count}
                  />
                </section>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* FAQ Section */}
                <section id="faq" className="scroll-mt-32">
                  <TabFAQ tourId={tour.id} />
                </section>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Program Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                    <div className="p-6 lg:p-8 bg-gray-50">
                      <div className="w-full h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
                    </div>
                    <div className="p-6 lg:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-40"></div>
                      </div>
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-3">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Price Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </section>

              {/* Info Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-40"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Overview Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                  ))}
                </div>
              </section>

              {/* Condition Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                  ))}
                </div>
              </section>

              {/* Gallery Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Review Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    </div>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-t pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Section Skeleton */}
              <section className="scroll-mt-32">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {showFloatingButton && (
        <div className="fixed bottom-6 right-24 z-50 slide-in-up">
          <button
            onClick={handleChatWithProvider}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Nhắn tin</span>
          </button>
        </div>
      )}

      {showCommentSection && (
        <div className="fade-in-up-delay-3">
          <CommentSection />
        </div>
      )}

      {/* Recently Viewed Tours - Horizontal Section */}
      <div className="w-full mb-5 mt-10 max-w-7xl mx-auto">
        <RecentlyViewedTours
          maxItems={5}
          title="Tour đã xem gần đây"
          className="mb-8"
          horizontal={true}
        />
      </div>

      {/* Similar Tours Section - lazy loaded */}
      <Suspense fallback={<div className="text-gray-500">Đang tải gợi ý tour tương tự...</div>}>
        {tour?.title && (
          <div className="w-full mb-5 mt-10 max-w-7xl mx-auto">
            <SimilarToursSection tourTitle={tour.title} currentTourId={tour.id} />
          </div>
        )}
      </Suspense>
    </>
  );
};

export default TourDetail;
