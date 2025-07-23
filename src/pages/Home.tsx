import React, { useMemo, useEffect } from "react";
import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { HeroSection } from "../components/home/HeroSection";
import MainTours from "../components/MainTours";
import { Footer } from "../layouts/Footer";
import FeaturedTours from "../components/FeaturedTours";
import TourListCarousel from "../components/TourCategoryList";
import BlogSection from "../components/BlogSection";

// Memoize tất cả components để tránh re-render không cần thiết
const MemoizedTopBar = React.memo(TopBar);
const MemoizedNavBar = React.memo(NavBar);
const MemoizedHeroSection = React.memo(HeroSection);
const MemoizedFeaturedTours = React.memo(FeaturedTours);
const MemoizedMainTours = React.memo(MainTours);
const MemoizedTourListCarousel = React.memo(TourListCarousel);
const MemoizedBlogSection = React.memo(BlogSection);
const MemoizedFooter = React.memo(Footer);

// Tạo Home component với memoization để tránh re-render
const Home = React.memo(() => {
  // Memoize container style để tránh re-calculation
  const containerStyle = useMemo(() => ({ 
    minHeight: '100vh',
    // Thêm CSS optimizations trực tiếp vào style
    contain: 'layout style paint',
    willChange: 'transform'
  }), []);

  // Optimize performance với CSS transformations
  useEffect(() => {
    // Thêm CSS optimizations cho smooth scrolling
    const style = document.createElement('style');
    style.textContent = `
      /* Hardware acceleration cho smooth scrolling */
      * {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      /* Optimize rendering performance */
      .min-h-screen > * {
        contain: layout style paint;
        will-change: auto;
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Prevent layout shifts */
      img {
        content-visibility: auto;
        contain-intrinsic-size: 0 500px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div style={containerStyle} className="min-h-screen">
      <MemoizedTopBar />
      <MemoizedNavBar />
      <MemoizedHeroSection />
      <MemoizedFeaturedTours />
      <MemoizedMainTours />
      <MemoizedTourListCarousel />
      <MemoizedBlogSection />
      <MemoizedFooter />
    </div>
  );
});

// Set displayName cho debugging
Home.displayName = 'Home';

export default Home;
