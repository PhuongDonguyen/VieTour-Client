import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { HeroSection } from "../components/HeroSection";
import { FloatingCard } from "../components/FloatingCard";
import MainTours from "../components/MainTours";
import {Footer} from "../components/Footer"


export default function Home() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <NavBar />
      <HeroSection />
      {/* <FloatingCard /> */}
      <MainTours />
      <Footer/>
    </div>
  );
}
