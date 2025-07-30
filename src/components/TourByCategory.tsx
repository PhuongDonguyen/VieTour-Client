import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTourCategoriesBySlug } from "../services/tourCategory.service";
import { fetchTours } from "../services/tour.service";
import { TourCard } from "../components/TourCard";

interface TourCardData {
  id: string;
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  views: string;
  comments: string;
  participants: string;
  totalStar: number;
  reviewCount: number;
  slug: string;
}

const TourCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-6 space-y-4">
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

      const toursRes = await fetchTours({ tour_category_id: category.id, page: pageNum, limit: 3 });
      const newTours = toursRes.data.map((tour: any) => ({
        id: tour.id,
        title: tour.title,
        image: tour.poster_url,
        originalPrice: tour.price || 0,
        discountedPrice: 680000, // TODO: Replace with real data
        discount: 23, // TODO: Replace with real data
        views: tour.view_count?.toString() || "0",
        comments: "3.8M", // TODO: Replace with real data
        participants: "45M", // TODO: Replace with real data
        totalStar: tour.total_star || 0,
        reviewCount: tour.review_count || 0,
        slug: tour.slug,
      }));

      setTours(prev => (append ? [...prev, ...newTours] : newTours));
      setHasNextPage(toursRes.pagination.hasNextPage);
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

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  };

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl md:text-4xl font-bold text-[#015294] mb-8 text-center">
        {categoryName}
      </h1>

      {isLoading && !tours.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      ) : tours.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => (
              <TourCard
                key={tour.id}
                id={tour.id}
                title={tour.title}
                image={tour.image}
                originalPrice={tour.originalPrice}
                discountedPrice={tour.discountedPrice}
                discount={tour.discount}
                views={tour.views}
                comments={tour.comments}
                participants={tour.participants}
                slug={tour.slug}
              />
            ))}
            {isLoading && [...Array(3)].map((_, i) => <TourCardSkeleton key={`skeleton-${i}`} />)}
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