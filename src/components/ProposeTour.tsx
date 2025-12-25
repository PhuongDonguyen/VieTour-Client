import React, { useEffect, useState } from "react";
import { fetchCollaborativeTourRecommendations } from "../services/tour.service";
import RecommendTourCard from "./RecommendTourCard";
import { SkeletonMainTours } from "./Skeleton";
import { useAuth } from "@/hooks/useAuth";

type TourCardData = {
  id: number;
  title: string;
  startingPoint: string;
  duration: string;
  price: number;
  imageUrl: string;
  slug: string;
};

const ProposeTour: React.FC = () => {
  const [tours, setTours] = useState<TourCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadTours = async () => {
      try {
        if (!user) {
          setTours([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const tourRes = await fetchCollaborativeTourRecommendations(
          "hybrid",
          8 // Limit số lượng tour hiển thị
        );
        console.log("tourRes:",tourRes);
        
        if (tourRes.success && tourRes.data) {
          setTours(
            tourRes.data.map((tour) => ({
              id: tour.id,
              title: tour.title,
              startingPoint: tour.starting_point || "Chưa cập nhật",
              duration: tour.duration ? String(tour.duration) : "Chưa cập nhật",
              price: tour.price || 0,
              imageUrl: tour.poster_url,
              slug: tour.slug,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching collaborative tour recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [user]);

  if (loading) {
    return <SkeletonMainTours />;
  }

  if (!user) {
    return null;
  }

  if (tours.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#015294] mb-4">
            TOUR GỢI Ý CHO BẠN
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tours.map((tour) => (
            <RecommendTourCard
              key={tour.id}
              id={tour.id}
              title={tour.title}
              startingPoint={tour.startingPoint}
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

export default ProposeTour;

