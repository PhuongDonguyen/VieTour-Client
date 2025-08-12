import { HeroSection } from "../components/home/HeroSection";
import { SearchSection } from "../components/home/SearchSection";
import MainTours from "../components/MainTours";
import FeaturedTours from "../components/FeaturedTours";
import TourListCarousel from "../components/TourCategoryList";
import BlogSection from "../components/BlogSection";
import { LazyLoad } from "../components/LazyLoad";
import {
  SkeletonSearchSection,
  SkeletonFeaturedTours,
  SkeletonMainTours,
  SkeletonTourCategories,
  SkeletonBlogSection
} from "../components/Skeleton";

export default function Home() {
  return (
    <div className="min-h-screen monserrat">
      {/* Hero Section - No lazy loading, immediate load */}
      <div>
        <HeroSection />
      </div>
      <SearchSection />

      {/* Featured Tours - Lazy load with animation */}
      <LazyLoad placeholder={<SkeletonFeaturedTours />}>
        <FeaturedTours />
      </LazyLoad>

      {/* Main Tours - Lazy load with animation */}
      <LazyLoad placeholder={<SkeletonMainTours />}>
        <MainTours />
      </LazyLoad>

      {/* Tour Category List - Lazy load with animation */}
      <LazyLoad placeholder={<SkeletonTourCategories />}>
        <TourListCarousel />
      </LazyLoad>

      <BlogSection />
    </div>
  );
}
