import { HeroSection } from "../components/home/HeroSection";
import MainTours from "../components/MainTours";
import FeaturedTours from "../components/FeaturedTours";
import TourListCarousel from "../components/TourCategoryList";
import BlogSection from "../components/BlogSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedTours />
      <MainTours />
      <TourListCarousel />
      <BlogSection />
    </div>
  );
}
