import React, { use, useEffect, useState } from "react";
import { fetchTourRecommend } from "../services/tour.service";
import RecommendTourCard from "./RecommendTourCard";
import { SkeletonMainTours } from "./Skeleton";

type TourCardData = {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  imageUrl: string;
  slug: string;
};

const RecommendedTours: React.FC = () => {
  const [tours, setTours] = useState<TourCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        const tourRes = await fetchTourRecommend();
        const toursData = tourRes.data;
        setTours(
          toursData.map((tour: any) => ({
            id: tour.tour_id,
            title: tour.name,
            location: tour.location || "Chưa cập nhật",
            duration: tour.duration ? `${tour.duration}` : "Chưa cập nhật",
            price: tour.price || 0,
            imageUrl: tour.poster_url,
            slug: tour.slug,
          }))
        );
      } catch (error) {
        console.error("Error fetching recommended tours:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  if (loading) {
    return <SkeletonMainTours />;
  }

  return (
    <div className="bg-gradient-to-br bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#015294] mb-4">CÓ THỂ BẠN SẼ THÍCH</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tours.map((tour) => (
            <RecommendTourCard
              key={tour.id}
              id={tour.id}
              title={tour.title}
              location={tour.location}
              duration={tour.duration}
              price={tour.price}
              imageUrl={tour.imageUrl}
              slug={tour.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedTours;
