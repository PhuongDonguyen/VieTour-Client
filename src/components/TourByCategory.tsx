import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTourCategoriesBySlug } from "../services/tourCategory.service";
import { fetchTours } from "../services/tour.service";
import SearchTourCard from "../components/SearchTourCard";
import { Home, ChevronRight } from "lucide-react";
import { ImageSize, ImageQuality, transformCloudinaryUrl } from "../utils/imageUtils";

interface TourCardData {
  id: number;
  title: string;
  startingPoint: string;
  duration: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  slug: string;
  viewCount: number;
  bookedCount: number;
}

const TourCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export const TourByCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tours, setTours] = useState<TourCardData[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (pageNum: number, append = false) => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    try {
      const categoryRes = await getTourCategoriesBySlug(slug);
      const category = categoryRes.data[0];
      if (!category?.id) throw new Error("Category not found");
      setCategoryName(category.name);

      const toursRes = await fetchTours({
        tour_category_id: category.id,
        page: pageNum,
        limit: 3,
      });
      const newTours = toursRes.data.map((tour: any) => ({
        id: tour.id,
        title: tour.title,
        startingPoint: tour.starting_point || "Chưa cập nhật",
        duration: tour.duration ? `${tour.duration}` : "Chưa cập nhật",
        price: tour.price || 0,
        imageUrl: transformCloudinaryUrl(tour.poster_url, ImageSize.THUMBNAIL, ImageQuality.MEDIUM, 'f_auto'),
        rating: tour.total_star / Math.max(tour.review_count, 1) || 0,
        reviewCount: tour.review_count || 0,
        slug: tour.slug,
        viewCount: tour.view_count || 0,
        bookedCount: tour.booked_count || 0,
      }));

      setTours((prev) => (append ? [...prev, ...newTours] : newTours));
      setHasNextPage(toursRes.pagination?.hasNextPage || false);
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError("Không tìm thấy danh mục hoặc tour.");
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [slug]);

  const handleLoadMore = async () => {
    if (hasNextPage && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchData(nextPage, true);
    }
  };

  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link
          to="/"
          className="flex items-center hover:text-orange-600 transition-colors duration-200"
        >
          <Home className="w-4 h-4 mr-1" />
          <span>Trang chủ</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#015294] mb-4">{categoryName}</h1>
        <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
      </div>

      {isLoading && !tours.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      ) : tours.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <SearchTourCard
                key={tour.id}
                id={tour.id}
                title={tour.title}
                startingPoint={tour.startingPoint}
                duration={tour.duration}
                price={tour.price}
                imageUrl={tour.imageUrl}
                rating={tour.rating}
                reviewCount={tour.reviewCount}
                slug={tour.slug}
                viewCount={tour.viewCount}
                bookedCount={tour.bookedCount}
              />
            ))}
            {isLoading &&
              [...Array(3)].map((_, i) => (
                <TourCardSkeleton key={`skeleton-${i}`} />
              ))}
          </div>

          {hasNextPage && !isLoading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                Xem thêm tour
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Chưa có tour nào cho danh mục này.
          </p>
        </div>
      )}
    </div>
  );
};
