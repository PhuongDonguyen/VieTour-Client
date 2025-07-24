import { HeroSection } from "../components/home/HeroSection";
import MainTours from "../components/MainTours";
import FeaturedTours from "../components/FeaturedTours";
import TourListCarousel from "../components/TourCategoryList";
import BlogSection from "../components/BlogSection";
import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import {Footer} from "../layouts/Footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <NavBar />
      <HeroSection />
      <FeaturedTours />
      <MainTours />
      <TourListCarousel />
      <BlogSection />
      <Footer/>
    </div>
  );
}
