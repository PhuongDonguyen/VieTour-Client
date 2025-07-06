import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { HeroSection } from "../components/HeroSection";
import { FloatingCard } from "../components/FloatingCard";
import MainTours from "../components/MainTours";
import FeaturedTours from "../components/FeaturedTours";
import TourListCarousel from "../components/TourCategoryList";

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <NavBar />
      <HeroSection />
      {/* <FloatingCard /> */}
      <FeaturedTours />
      <MainTours />
      <TourListCarousel />
    </div>
  );
}
