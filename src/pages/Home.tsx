import { HeroSection } from "../components/home/HeroSection";
import { SearchSection } from "../components/home/SearchSection";
import MainTours from "../components/MainTours";
import FeaturedTours from "../components/FeaturedTours";
import TourListCarousel from "../components/TourCategoryList";
import BlogSection from "../components/BlogSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div>
        <HeroSection />
      </div>
      <div>
        <SearchSection />
      </div>
      <div>
        <FeaturedTours />
      </div>
      <div>
        <MainTours />
      </div>
      <div>
        <TourListCarousel />
      </div>
      <div>
        <BlogSection />
      </div>
    </div>
  );
}
