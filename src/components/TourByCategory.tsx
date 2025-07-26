import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTourCategoriesBySlug } from "../services/tourCategory.service";
import { TourCard } from "../components/TourCard";
import { fetchToursByCategoryId } from "../services/tour.service"
import { Loading } from "./Loading";

interface TourCardProps {
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
  const [tours, setTours] = useState<TourCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nameTourCategory, setNameTourCategory] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!slug) return;
        setLoading(true);
        const tourCategory = await getTourCategoriesBySlug(slug);
        setNameTourCategory(tourCategory.data[0].name);
        const tourRes = await fetchToursByCategoryId(
          tourCategory.data[0].id
        );
        const tourResData = tourRes.data;
        setTours(
          tourResData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            originalPrice: tour.price || 0,
            discountedPrice: 680000,
            image: tour.poster_url,
            totalStar: tour.total_star || 0,
            reviewCount: tour.review_count || 0,
            views: tour.view_count?.toString() || "",
            comments: "3.8M",
            participants: "45M",
            discount: 23,
            slug: tour.slug
          }))
        );
      } catch (error) {
        console.error("Lỗi khi load dữ liệu: ", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);





  return (
    <div className="max-h-screen mt-17 bg-gradient-to-br bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">
            {nameTourCategory}
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        {loading ? <Loading /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => (
              <TourCard key={index} {...tour} />
            ))}
          </div>)}
      </div>
    </div>
  );
};
