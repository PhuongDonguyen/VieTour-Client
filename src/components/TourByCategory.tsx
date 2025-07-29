import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTourCategoriesBySlug } from "../services/tourCategory.service";
import { TourCard } from "../components/TourCard";
import { fetchToursByCategoryId } from "../services/tour.service";
import { Loading } from "./Loading";

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
  onBookTour?: (id: string) => void;
}

export const TourByCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tours, setTours] = useState<TourCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchToursByCategory = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        // Fetch category info by slug
        const categoryRes = await getTourCategoriesBySlug(slug);
        const category = categoryRes.data[0];
        setCategoryName(category.name);

        // Fetch tours by category id
        const toursRes = await fetchToursByCategoryId(category.id);
        const toursData = toursRes.data;
        setTours(
          toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            originalPrice: tour.price || 0,
            discountedPrice: 680000, // TODO: Replace with real discounted price if available
            image: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            views: tour.view_count?.toString() || "",
            comments: "3.8M", // TODO: Replace with real data if available
            participants: "45M", // TODO: Replace with real data if available
            discount: 23, // TODO: Replace with real discount if available
            slug: tour.slug,
          }))
        );
      } catch (error) {
        console.error("Error loading tours by category:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToursByCategory();
  }, [slug]);

  return (
    <div className="max-w-6xl container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl md:text-4xl font-bold text-[#015294] mb-8 text-center">
        {categoryName}
      </h1>

      {isLoading ? (
        <Loading />
      ) : tours.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {tours.map((tour) => (
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
        </div>
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
